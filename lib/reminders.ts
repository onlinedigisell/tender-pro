import { prisma } from "./prisma";
import { sendPushNotification } from "./push";

function indiaDateAsUtcMidnight(offsetDays = 0) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date;
}

export async function runTenderReminderCheck() {
  const today = indiaDateAsUtcMidnight();

  const tenders = await prisma.tender.findMany({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS"] },
      bidSubmitted: false,
      endDate: {
        gte: today,
      },
    },
    orderBy: { endDate: "asc" },
  });

  let created = 0;

  for (const tender of tenders) {
    const closingDate = tender.endDate.toLocaleDateString("en-IN");
    const closing = indiaDateAsUtcMidnight();
    closing.setUTCFullYear(tender.endDate.getFullYear(), tender.endDate.getMonth(), tender.endDate.getDate());
    const daysLeft = Math.round((closing.getTime() - today.getTime()) / 86400000);
    const dayLabel =
      daysLeft === 0 ? "closes today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
    const message = `Tender deadline alert: ${tender.title} - ${dayLabel} (${closingDate})`;

    const existing = await prisma.notification.findFirst({
      where: { message },
    });

    if (existing) continue;

    await prisma.notification.create({
      data: { message },
    });

    await sendPushNotification({
      title: `Tender deadline: ${dayLabel}`,
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
