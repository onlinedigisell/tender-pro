import MetricCard from "../components/MetricCard";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

function money(value?: number | null) {
  return `INR ${Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function percent(value: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function groupCount<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item || "Unknown"] = (acc[item || "Unknown"] ?? 0) + 1;
    return acc;
  }, {});
}

export default async function ReportsPage() {
  const tenders = await prisma.tender.findMany({
    orderBy: { endDate: "desc" },
    take: 120,
  });

  const totalTenders = tenders.length;
  const bidTenders = tenders.filter((tender) => tender.bidDecision === "BID" || tender.bidSubmitted).length;
  const wonTenders = tenders.filter((tender) => tender.resultStatus === "WON").length;
  const awardedValue = tenders
    .filter((tender) => tender.resultStatus === "WON")
    .reduce((sum, tender) => sum + Number(tender.actualTenderCost ?? tender.quotedRate ?? tender.value ?? 0), 0);
  const participatedValue = tenders.reduce((sum, tender) => sum + Number(tender.value ?? 0), 0);
  const quotedValue = tenders.reduce((sum, tender) => sum + Number(tender.quotedRate ?? 0), 0);
  const pendingDocuments = tenders.filter((tender) => !tender.documentPrepared && tender.status === "OPEN").length;
  const upcomingBidLoad = tenders.filter((tender) => {
    const days = Math.ceil((tender.endDate.getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 14 && !tender.bidSubmitted;
  }).length;
  const avgMargin = quotedValue && participatedValue ? percent(Math.max(participatedValue - quotedValue, 0), participatedValue) : "0%";

  const departmentStats = Object.entries(groupCount(tenders.map((tender) => tender.department))).slice(0, 8);
  const regionStats = Object.entries(groupCount(tenders.map((tender) => tender.location))).slice(0, 8);
  const monthlyStats = Object.entries(
    tenders.reduce<Record<string, { count: number; value: number }>>((acc, tender) => {
      const key = tender.startDate.toLocaleString("en-IN", { month: "short", year: "numeric" });
      acc[key] = acc[key] ?? { count: 0, value: 0 };
      acc[key].count += 1;
      acc[key].value += Number(tender.value ?? 0);
      return acc;
    }, {}),
  ).slice(0, 6);

  return (
    <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-black uppercase tracking-wider text-blue-700">Executive Reports</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Tender Performance Intelligence</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Track tender participation, bid value, award performance, bid margin, department exposure,
          region-wise pipeline, and upcoming bid load.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Monthly participation" value={totalTenders} detail="Tender records analyzed" tone="blue" />
        <MetricCard label="Tender value participated" value={money(participatedValue)} detail="Estimated opportunity" tone="slate" />
        <MetricCard label="Win ratio" value={percent(wonTenders, bidTenders)} detail={`${wonTenders} awarded from ${bidTenders} submitted`} tone="emerald" />
        <MetricCard label="Average bid margin" value={avgMargin} detail="Estimated from value vs quoted" tone="amber" />
        <MetricCard label="Submitted vs awarded" value={`${bidTenders}/${wonTenders}`} detail="Submission conversion" tone="emerald" />
        <MetricCard label="Upcoming bid load" value={upcomingBidLoad} detail="Next 14 days" tone="rose" />
        <MetricCard label="Revenue pipeline" value={money(awardedValue)} detail="Awarded work value" tone="emerald" />
        <MetricCard label="Pending documents" value={pendingDocuments} detail="Open tenders needing readiness" tone="amber" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">Monthly Tender Participation</h2>
          <div className="mt-4 grid gap-3">
            {monthlyStats.map(([month, data]) => (
              <div key={month} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{month}</p>
                  <p className="text-sm font-black text-blue-700">{data.count} tenders</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">{money(data.value)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">Department-wise Performance</h2>
          <div className="mt-4 grid gap-3">
            {departmentStats.map(([department, count]) => (
              <div key={department} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                <p className="break-words text-sm font-bold">{department}</p>
                <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">Region-wise Performance</h2>
          <div className="mt-4 grid gap-3">
            {regionStats.map(([region, count]) => (
              <div key={region} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                <p className="break-words text-sm font-bold">{region}</p>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-black">Tender Register Analytics</h2>
            <p className="text-sm text-slate-600">Mobile-friendly executive table for bid decisions and awards.</p>
          </div>
          <a href="/tenders" className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white">
            Update records
          </a>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                <th className="border-y border-l border-slate-200 px-3 py-3">Tender</th>
                <th className="border-y border-slate-200 px-3 py-3">Department</th>
                <th className="border-y border-slate-200 px-3 py-3">Close</th>
                <th className="border-y border-slate-200 px-3 py-3">Bid</th>
                <th className="border-y border-slate-200 px-3 py-3">Quoted</th>
                <th className="border-y border-slate-200 px-3 py-3">Result</th>
                <th className="border-y border-r border-slate-200 px-3 py-3">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {tenders.map((tender) => (
                <tr key={tender.id}>
                  <td className="border-b border-l border-slate-200 px-3 py-3 font-bold">{tender.title}</td>
                  <td className="border-b border-slate-200 px-3 py-3">{tender.department}</td>
                  <td className="border-b border-slate-200 px-3 py-3">{tender.endDate.toLocaleDateString("en-IN")}</td>
                  <td className="border-b border-slate-200 px-3 py-3">{tender.bidDecision}</td>
                  <td className="border-b border-slate-200 px-3 py-3">{money(tender.quotedRate)}</td>
                  <td className="border-b border-slate-200 px-3 py-3">{tender.resultStatus}</td>
                  <td className="border-b border-r border-slate-200 px-3 py-3">
                    {tender.workDoneCertificate ? "Received" : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 lg:hidden">
          {tenders.map((tender) => (
            <article key={tender.id} className="rounded-md border border-slate-200 p-4">
              <h3 className="font-black">{tender.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{tender.department} | {tender.location}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <p><span className="text-slate-500">Close:</span> {tender.endDate.toLocaleDateString("en-IN")}</p>
                <p><span className="text-slate-500">Bid:</span> {tender.bidDecision}</p>
                <p><span className="text-slate-500">Quoted:</span> {money(tender.quotedRate)}</p>
                <p><span className="text-slate-500">Result:</span> {tender.resultStatus}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
