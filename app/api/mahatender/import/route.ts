import { prisma } from "../../../../lib/prisma";
import { mahatenderImportPayload, parseMahaTenderText } from "../../../../lib/mahatenderParser";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  const body = await req.json();
  const text = String(body.text ?? "");
  const pageUrl = body.pageUrl ? String(body.pageUrl) : "";

  if (text.trim().length < 30) {
    return Response.json(
      { error: "Open a MahaTender tender list/details page first, then run Tender Pro Sync." },
      { status: 400, headers: corsHeaders },
    );
  }

  const parsed = parseMahaTenderText(text);

  if (parsed.length === 0) {
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

  return Response.json(
    { imported: synced.length, created, updated, tenders: synced },
    { headers: corsHeaders },
  );
}
