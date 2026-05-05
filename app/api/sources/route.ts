import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const sources = await prisma.tenderSource.findMany();
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