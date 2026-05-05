import { prisma } from "../../../../lib/prisma";

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
    data: {
      title: body.title,
      department: body.department,
      location: body.location,
      value: body.value ? Number(body.value) : null,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: body.status || "OPEN",
    },
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
