import { prisma } from "./prisma";
import { sendPushNotification } from "./push";

export async function runTenderReminderCheck() {
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
    orderBy: { endDate: "asc" },
  });

  let created = 0;

  for (const tender of tenders) {
    const closingDate = tender.endDate.toLocaleDateString("en-IN");
    const message = `Tender closing soon: ${tender.title} closes on ${closingDate}`;

    const existing = await prisma.notification.findFirst({
      where: { message },
    });

    if (existing) continue;

    await prisma.notification.create({
      data: { message },
    });

    await sendPushNotification({
      title: "Tender closing soon",
      body: `${tender.title} closes on ${closingDate}`,
      url: "/tenders",
    });

    created += 1;
  }

  return {
    checked: tenders.length,
    created,
  };
}
