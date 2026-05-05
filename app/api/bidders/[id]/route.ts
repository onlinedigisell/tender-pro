import { prisma } from "../../../../lib/prisma";
import { bidderPayload } from "../../../../lib/bidderData";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const bidder = await prisma.bidder.update({
    where: { id },
    data: bidderPayload(body),
  });

  return Response.json(bidder);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;

  await prisma.bidder.delete({ where: { id } });

  return Response.json({ ok: true });
}
