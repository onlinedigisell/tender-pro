import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);

  const tenders = await prisma.tender.findMany({
    where: {
      status: "OPEN",
      endDate: {
        gte: today,
        lte: sevenDaysLater,
      },
    },
  });

  for (const tender of tenders) {
    await prisma.notification.create({
      data: {
        message: `Tender closing soon: ${tender.title}`,
      },
    });
  }

  return Response.json({
    message: "Reminder check completed",
    count: tenders.length,
  });
}