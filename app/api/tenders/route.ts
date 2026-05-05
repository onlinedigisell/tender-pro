import { prisma } from "../../../lib/prisma";
import { tenderPayload } from "../../../lib/tenderData";

export async function GET() {
  const tenders = await prisma.tender.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json(tenders);
}

export async function POST(req: Request) {
  const body = await req.json();

  const tender = await prisma.tender.create({
    data: tenderPayload(body),
  });

  return Response.json(tender);
}
