import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const activities = await prisma.activity.findMany({
    orderBy: { date: "asc" },
  });

  return Response.json(activities);
}

export async function POST(req: Request) {
  const body = await req.json();

  const activity = await prisma.activity.create({
    data: {
      title: body.title,
      date: new Date(body.date),
      status: body.status || "PENDING",
    },
  });

  return Response.json(activity);
}