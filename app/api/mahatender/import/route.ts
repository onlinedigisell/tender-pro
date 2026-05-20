import { prisma } from "../../../../lib/prisma";
import { mahatenderImportPayload, parseMahaTenderText } from "../../../../lib/mahatenderParser";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function redirectResult(req: Request, params: Record<string, string | number>) {
  const url = new URL("/mahatender", req.url);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  return Response.redirect(url, 303);
}

async function readPayload(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    return {
      text: String(formData.get("text") ?? ""),
      pageUrl: String(formData.get("pageUrl") ?? ""),
      redirect: true,
    };
  }

  const body = await req.json();
  return {
    text: String(body.text ?? ""),
    pageUrl: body.pageUrl ? String(body.pageUrl) : "",
    redirect: false,
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  const { text, pageUrl, redirect } = await readPayload(req);

  if (text.trim().length < 30) {
    if (redirect) {
      return redirectResult(req, {
        sync: "error",
        message: "No page text found. Open MahaTender tender list/details page and click sync again.",
      });
    }
    return Response.json(
      { error: "Open a MahaTender tender list/details page first, then run Tender Pro Sync." },
      { status: 400, headers: corsHeaders },
    );
  }

  const parsed = parseMahaTenderText(text);

  if (parsed.length === 0) {
    if (redirect) {
      return redirectResult(req, {
        sync: "error",
        message: "No tender records found. Open current/recent tender list or detail page and sync again.",
      });
    }
    return Response.json(
      { error: "No tender records were found. Open the tender list/details page after login and run sync again." },
      { status: 422, headers: corsHeaders },
    );
  }

  const synced = [];
  let created = 0;
  let updated = 0;

  for (const tender of parsed.slice(0, 25)) {
    const data = mahatenderImportPayload({
      ...tender,
      onlineLink: tender.onlineLink || pageUrl,
      notes: `${tender.notes}\n\nSynced page: ${pageUrl}`,
    });

    const existing = await prisma.tender.findFirst({
      where: {
        OR: [
          data.onlineLink ? { onlineLink: data.onlineLink } : undefined,
          {
            title: data.title,
            department: data.department,
            endDate: data.endDate,
          },
        ].filter(Boolean) as any,
      },
    });

    if (existing) {
      const saved = await prisma.tender.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          department: data.department,
          location: data.location,
          value: data.value,
          startDate: data.startDate,
          endDate: data.endDate,
          onlineLink: data.onlineLink,
          notes: data.notes,
        },
      });
      synced.push(saved);
      updated += 1;
    } else {
      const saved = await prisma.tender.create({ data });
      synced.push(saved);
      created += 1;
    }
  }

  if (redirect) {
    return redirectResult(req, {
      sync: "done",
      imported: synced.length,
      created,
      updated,
    });
  }

  return Response.json(
    { imported: synced.length, created, updated, tenders: synced },
    { headers: corsHeaders },
  );
}
