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
      "user-agent":
        "Mozilla/5.0 TenderPro/1.0 (+https://github.com/onlinedigisell/tender-pro)",
      accept: "text/html,application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${source.name} returned ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (contentType.includes("application/json") || text.trim().startsWith("{")) {
    return parseJsonTenderItems(JSON.parse(text), source.url);
  }

  return parseHtmlTenderItems(text, source.url);
}
