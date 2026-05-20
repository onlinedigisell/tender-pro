import { prisma } from "../../../../lib/prisma";
import { mahatenderImportPayload, parseMahaTenderText } from "../../../../lib/mahatenderParser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const text = String(body.text ?? "");

  if (text.trim().length < 30) {
    return Response.json({ error: "Paste MahaTender tender text first." }, { status: 400 });
  }

  const parsed = parseMahaTenderText(text);

  if (parsed.length === 0) {
    return Response.json(
      { error: "No tender records were found. Paste the tender list/details text after login." },
      { status: 422 },
    );
  }

  const created = [];
  for (const tender of parsed.slice(0, 25)) {
    const saved = await prisma.tender.create({
      data: mahatenderImportPayload(tender),
    });
    created.push(saved);
  }

  return Response.json({ imported: created.length, tenders: created });
}
