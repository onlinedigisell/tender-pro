import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let cronStarted = false;

export function startCron() {
  if (cronStarted) return;
  cronStarted = true;

  cron.schedule("* * * * *", async () => {
    console.log("Running reminder check...");

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
      const message = `⏰ Tender closing soon: ${tender.title}`;

      const existing = await prisma.notification.findFirst({
        where: {
          message: message,
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            message: message,
          },
        });
      }
    }
  });
}