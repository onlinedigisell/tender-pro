import { prisma } from "../lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

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

function daysRemaining(endDate: Date) {
  const today = indiaDateAsUtcMidnight();
  const closing = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));
  return Math.round((closing.getTime() - today.getTime()) / 86400000);
}

function deadlineLabel(endDate: Date) {
  const days = daysRemaining(endDate);

  if (days < 0) return "Overdue";
  if (days === 0) return "Closes today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

export default async function Home() {
  const today = indiaDateAsUtcMidnight();
  const sevenDaysLater = indiaDateAsUtcMidnight(7);

  const [
    openTenders,
    closingSoon,
    submittedTenders,
    activitiesToday,
    closingSoonTenders,
    liveTenders,
    notifications,
  ] = await Promise.all([
    prisma.tender.count({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS", "SUBMITTED"] },
        resultStatus: { not: "WON" },
      },
    }),
    prisma.tender.count({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS", "SUBMITTED"] },
        endDate: { gte: today, lte: sevenDaysLater },
      },
    }),
    prisma.tender.count({ where: { status: "SUBMITTED" } }),
    prisma.activity.count({
      where: {
        date: {
          gte: today,
          lt: indiaDateAsUtcMidnight(1),
        },
      },
    }),
    prisma.tender.findMany({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS", "SUBMITTED"] },
        endDate: { gte: today, lte: sevenDaysLater },
      },
      orderBy: { endDate: "asc" },
      take: 12,
    }),
    prisma.externalTender.findMany({
      orderBy: { fetchedAt: "desc" },
      take: 5,
      include: { source: { select: { name: true } } },
    }),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Active tenders", value: openTenders, tone: "border-l-blue-600" },
    { label: "Closing soon", value: closingSoon, tone: "border-l-amber-500" },
    { label: "Submitted", value: submittedTenders, tone: "border-l-emerald-600" },
    { label: "Today activities", value: activitiesToday, tone: "border-l-slate-700" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Tender command center
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Track active tenders, live source alerts, activities, and urgent deadlines.
          </p>
        </div>
        <a
          href="/sources"
          className="inline-flex w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Fetch live tenders
        </a>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className={`border-l-4 ${item.tone} rounded-md bg-white p-5 shadow-sm`}>
            <p className="text-sm font-medium text-slate-600">{item.label}</p>
            <p className="mt-3 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-md bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Tender closing list</h2>
              <p className="text-sm text-slate-600">
                All active tenders closing in the next 7 days, with exact remaining days.
              </p>
            </div>
            <a href="/tenders" className="text-sm font-semibold text-blue-700">
              Manage tenders
            </a>
          </div>

          <div className="grid gap-3">
            {closingSoonTenders.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                No active tenders are closing in the next 7 days.
              </p>
            ) : (
              closingSoonTenders.map((tender) => (
                <div
                  key={tender.id}
                  className="grid gap-3 rounded-md border border-slate-200 p-4 lg:grid-cols-[1.5fr_120px_120px_130px_130px] lg:items-center"
                >
                  <div>
                    <p className="font-semibold">{tender.title}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {tender.department} . {tender.location}
                    </p>
                  </div>
                  <span className="w-fit rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                    {deadlineLabel(tender.endDate)}
                  </span>
                  <p className="text-sm font-medium">{formatDate(tender.endDate)}</p>
                  <span className="w-fit rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                    {tender.bidDecision}
                  </span>
                  <span
                    className={`w-fit rounded-md px-2 py-1 text-xs font-bold ${
                      tender.documentPrepared
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {tender.documentPrepared ? "Docs ready" : "Docs pending"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-md bg-white p-5 shadow-sm xl:col-span-2">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-lg font-bold">Mobile app and reminders</h2>
              <p className="mt-1 text-sm text-slate-600">
                Open this site on your phone, choose Add to Home Screen, then tap Enable notifications.
                Tender Pro will send closing-date reminders to subscribed phones and PCs.
              </p>
            </div>
            <a
              href="/tenders"
              className="w-fit rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Add tender deadline
            </a>
          </div>
        </div>

        <div className="rounded-md bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Latest live tenders</h2>
            <a href="/sources" className="text-sm font-semibold text-blue-700">
              View monitor
            </a>
          </div>
          <div className="grid gap-3">
            {liveTenders.length === 0 ? (
              <p className="text-sm text-slate-500">No live tenders fetched yet.</p>
            ) : (
              liveTenders.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  className="rounded-md border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50"
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.source.name} . {formatDate(item.fetchedAt)}
                  </p>
                </a>
              ))
            )}
          </div>
        </div>

        <div className="rounded-md bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent alerts</h2>
            <a href="/notifications" className="text-sm font-semibold text-blue-700">
              All alerts
            </a>
          </div>
          <div className="grid gap-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500">No alerts yet.</p>
            ) : (
              notifications.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-200 p-4">
                  <p className="font-medium">{item.message}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(item.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
