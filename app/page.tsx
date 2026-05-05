import { prisma } from "../lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function Home() {
  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);

  const [
    openTenders,
    closingSoon,
    submittedTenders,
    activitiesToday,
    liveTenders,
    notifications,
  ] = await Promise.all([
    prisma.tender.count({ where: { status: "OPEN" } }),
    prisma.tender.count({
      where: {
        status: "OPEN",
        endDate: { gte: today, lte: sevenDaysLater },
      },
    }),
    prisma.tender.count({ where: { status: "SUBMITTED" } }),
    prisma.activity.count({
      where: {
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        },
      },
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
    { label: "Open tenders", value: openTenders, tone: "border-l-blue-600" },
    { label: "Closing in 7 days", value: closingSoon, tone: "border-l-amber-500" },
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
