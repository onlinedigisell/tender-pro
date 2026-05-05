type SourceInput = {
  id: string;
  name: string;
  url: string;
};

export type FetchedTender = {
  title: string;
  link: string;
  summary?: string;
};

const TENDER_WORDS = [
  "tender",
  "bid",
  "procurement",
  "rfp",
  "eoi",
  "nit",
  "quotation",
  "contract",
  "auction",
  "work order",
];

const BROWSER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7",
  "accept-language": "en-IN,en;q=0.9",
  "cache-control": "no-cache",
  pragma: "no-cache",
};

function isMahaTender(source: SourceInput) {
  return /mahatenders\.gov\.in/i.test(source.url) || /maha\s*tender/i.test(source.name);
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " "));
}

function looksLikeTender(text: string) {
  const value = text.toLowerCase();
  return TENDER_WORDS.some((word) => value.includes(word));
}

function normalizeUrl(link: string, sourceUrl: string) {
  try {
    return new URL(decodeHtml(link), sourceUrl).toString();
  } catch {
    return "";
  }
}

function uniqueItems(items: FetchedTender[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = item.link.toLowerCase();
    if (!item.title || !item.link || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseJsonTenderItems(data: unknown, sourceUrl: string): FetchedTender[] {
  const items: FetchedTender[] = [];

  function walk(value: unknown) {
    if (!value || items.length >= 50) return;

    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (typeof value === "object") {
      const record = value as Record<string, unknown>;
      const title = String(
        record.title ?? record.name ?? record.tenderTitle ?? record.description ?? "",
      );
      const rawLink = String(record.link ?? record.url ?? record.tenderUrl ?? "");
      const link = rawLink ? normalizeUrl(rawLink, sourceUrl) : "";

      if (title && link && looksLikeTender(`${title} ${link}`)) {
        items.push({
          title: title.slice(0, 240),
          link,
          summary: String(record.summary ?? record.department ?? "").slice(0, 300) || undefined,
        });
      }

      Object.values(record).forEach(walk);
    }
  }

  walk(data);
  return uniqueItems(items);
}

function parseHtmlTenderItems(html: string, sourceUrl: string): FetchedTender[] {
  const items: FetchedTender[] = [];
  const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) && items.length < 50) {
    const link = normalizeUrl(match[1], sourceUrl);
    const title = stripTags(match[2]).slice(0, 240);

    if (link && title && looksLikeTender(`${title} ${link}`)) {
      items.push({ title, link });
    }
  }

  return uniqueItems(items);
}

export async function fetchTenderSource(source: SourceInput) {
  const response = await fetch(source.url, {
    headers: {
      ...BROWSER_HEADERS,
      referer: isMahaTender(source)
        ? "https://mahatenders.gov.in/nicgep/app"
        : source.url,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${source.name} returned ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (isMahaTender(source) && /Enter Captcha|captchaText|Provide Captcha/i.test(text)) {
    throw new Error(
      "MahaTender official portal requires captcha before showing active tenders. Open the source link manually, or use a paid/API source without captcha.",
    );
  }

  if (contentType.includes("application/json") || text.trim().startsWith("{")) {
    return parseJsonTenderItems(JSON.parse(text), source.url);
  }

  return parseHtmlTenderItems(text, source.url);
}
