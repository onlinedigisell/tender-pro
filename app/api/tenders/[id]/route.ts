import { prisma } from "../../../../lib/prisma";
import { tenderPayload } from "../../../../lib/tenderData";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const tender = await prisma.tender.update({
    where: { id },
    data: tenderPayload(body),
  });

  return Response.json(tender);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;

  await prisma.tender.delete({
    where: { id },
  });

  return Response.json({ ok: true });
}
