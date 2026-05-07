import MetricCard from "./components/MetricCard";
import WorkflowTracker from "./components/WorkflowTracker";
import { prisma } from "../lib/prisma";
import { buildSmartAlerts, statusTone, workflowStageForTender } from "../lib/intelligence";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function money(value?: number | null) {
  return `INR ${Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
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
  if (days < 0) return { text: "Overdue", tone: "OVERDUE" };
  if (days === 0) return { text: "Closes today", tone: "DEADLINE_NEAR" };
  if (days === 1) return { text: "1 day left", tone: "DEADLINE_NEAR" };
  if (days <= 7) return { text: `${days} days left`, tone: "IN_REVIEW" };
  return { text: `${days} days left`, tone: "DRAFT" };
}

export default async function Home() {
  const today = indiaDateAsUtcMidnight();
  const sevenDaysLater = indiaDateAsUtcMidnight(7);

  const activeTenderWhere = {
    status: { in: ["OPEN", "IN_PROGRESS", "SUBMITTED"] },
  };

  const tenders = await prisma.tender.findMany({
    orderBy: { endDate: "asc" },
    take: 80,
    include: { _count: { select: { bidders: true } } },
  });

  const liveTenders = await prisma.externalTender.findMany({
    orderBy: { fetchedAt: "desc" },
    take: 5,
    include: { source: { select: { name: true } } },
  });

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const openTenders = tenders.filter((tender) =>
    ["OPEN", "IN_PROGRESS", "SUBMITTED"].includes(tender.status),
  );
  const closingSoonTenders = tenders
    .filter((tender) => tender.endDate >= today && tender.endDate <= sevenDaysLater)
    .slice(0, 10);
  const totalValue = tenders.reduce((sum, tender) => sum + Number(tender.value ?? 0), 0);
  const submittedTenders = tenders.filter((tender) => tender.bidSubmitted || tender.status === "SUBMITTED");
  const wonTenders = tenders.filter((tender) => tender.resultStatus === "WON");
  const pendingDocuments = openTenders.filter((tender) => !tender.documentPrepared).length;
  const highRisk = openTenders.filter((tender) => daysRemaining(tender.endDate) <= 2 && !tender.bidSubmitted).length;
  const awardRate = submittedTenders.length
    ? `${Math.round((wonTenders.length / submittedTenders.length) * 100)}%`
    : "0%";
  const smartAlerts = buildSmartAlerts(openTenders).slice(0, 8);

  const stats = [
    { label: "Active tenders", value: openTenders.length, detail: "Live bid pipeline", tone: "blue" as const },
    { label: "Due this week", value: closingSoonTenders.length, detail: "Submission watchlist", tone: "amber" as const },
    { label: "Total tender value", value: money(totalValue), detail: "Estimated opportunity", tone: "slate" as const },
    { label: "Submitted bids", value: submittedTenders.length, detail: "Bids sent to portal", tone: "emerald" as const },
    { label: "Award rate", value: awardRate, detail: "Won from submitted", tone: "emerald" as const },
    { label: "Pending documents", value: pendingDocuments, detail: "Needs bid readiness", tone: "amber" as const },
    { label: "High-risk tenders", value: highRisk, detail: "Deadline or missing docs", tone: "rose" as const },
  ];

  return (
    <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
              Tender Intelligence Command Center
            </p>
            <h1 className="mt-2 max-w-4xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              AI-powered tender intelligence and bid management platform
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              From tender discovery to RFP analysis, eligibility review, bid submission, competitor
              tracking, award monitoring, and revenue pipeline.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/rfp"
              className="rounded-md bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
            >
              Analyze RFP
            </a>
            <a
              href="/tenders"
              className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Add Tender
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black">Submission Tracker</h2>
              <p className="text-sm text-slate-600">Active tenders with workflow stage and deadline risk.</p>
            </div>
            <a href="/tenders" className="text-sm font-bold text-blue-700">
              Manage tender register
            </a>
          </div>

          <div className="grid gap-4">
            {openTenders.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-bold text-slate-800">No active tenders in pipeline</p>
                <p className="mt-1 text-sm text-slate-500">Add a tender or fetch from live sources to start tracking.</p>
              </div>
            ) : (
              openTenders.slice(0, 6).map((tender) => {
                const deadline = deadlineLabel(tender.endDate);
                const stage = workflowStageForTender(tender);

                return (
                  <article key={tender.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words text-base font-black text-slate-950">{tender.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {tender.department} | {tender.location} | {money(tender.value)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <span className={`rounded-md px-2 py-1 text-xs font-black ${statusTone(tender.status)}`}>
                          {tender.status}
                        </span>
                        <span className={`rounded-md px-2 py-1 text-xs font-black ${statusTone(deadline.tone)}`}>
                          {deadline.text}
                        </span>
                        <span className={`rounded-md px-2 py-1 text-xs font-black ${statusTone(tender.resultStatus)}`}>
                          {tender.resultStatus}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <WorkflowTracker currentStage={stage} />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <aside className="grid gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black">Smart Alerts</h2>
              <a href="/notifications" className="text-sm font-bold text-blue-700">
                View all
              </a>
            </div>
            <div className="grid gap-3">
              {[...smartAlerts, ...notifications.map((item) => ({
                severity: "Low" as const,
                type: "Corrigendum added" as const,
                message: item.message,
                due: formatDate(item.createdAt),
              }))].slice(0, 6).map((alert, index) => (
                <div key={`${alert.message}-${index}`} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`rounded-md px-2 py-1 text-xs font-black ${statusTone(alert.severity === "Critical" ? "HIGH_RISK" : alert.severity === "High" ? "DEADLINE_NEAR" : "IN_REVIEW")}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{alert.due}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-5 text-slate-800">{alert.message}</p>
                </div>
              ))}
              {smartAlerts.length === 0 && notifications.length === 0 && (
                <p className="rounded-md border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                  No critical alerts right now.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black">Tender Discovery</h2>
              <a href="/sources" className="text-sm font-bold text-blue-700">
                Live sources
              </a>
            </div>
            <div className="grid gap-3">
              {liveTenders.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                  No live tenders fetched yet.
                </p>
              ) : (
                liveTenders.map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    className="rounded-md border border-slate-200 p-3 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <p className="line-clamp-2 text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.source.name} | {formatDate(item.fetchedAt)}
                    </p>
                  </a>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
