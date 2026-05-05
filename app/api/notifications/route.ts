import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
    });

    return Response.json(notifications || []);
  } catch (error) {
    console.error(error);
    return Response.json([]);
  }
}