import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const tenders = await prisma.tender.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json(tenders);
}

export async function POST(req: Request) {
  const body = await req.json();

  const tender = await prisma.tender.create({
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