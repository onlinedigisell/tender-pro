import { prisma } from "../../../lib/prisma";

export async function GET() {
  const sources = await prisma.tenderSource.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { externalTenders: true },
      },
    },
  });

  return Response.json(sources);
}

export async function POST(req: Request) {
  const body = await req.json();

  const source = await prisma.tenderSource.create({
    data: {
      name: body.name,
      url: body.url,
    },
  });

  await prisma.notification.create({
    data: {
      message: `Tender source added: ${body.name}`,
    },
  });

  return Response.json(source);
}
