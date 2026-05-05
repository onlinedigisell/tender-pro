import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

function money(value?: number | null) {
  return Number(value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function percent(value: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export default async function ReportsPage() {
  const [
    tenders,
    totalTenders,
    bidTenders,
    notBidTenders,
    wonTenders,
    completedWorks,
    certificateReceived,
    estimated,
    quoted,
    actual,
    expenses,
    wonAmount,
  ] = await Promise.all([
    prisma.tender.findMany({
      orderBy: { endDate: "desc" },
      take: 100,
    }),
    prisma.tender.count(),
    prisma.tender.count({ where: { bidDecision: "BID" } }),
    prisma.tender.count({ where: { bidDecision: "NOT_BID" } }),
    prisma.tender.count({ where: { resultStatus: "WON" } }),
    prisma.tender.count({ where: { workCompleted: true } }),
    prisma.tender.count({ where: { workDoneCertificate: true } }),
    prisma.tender.aggregate({ _sum: { value: true } }),
    prisma.tender.aggregate({ _sum: { quotedRate: true } }),
    prisma.tender.aggregate({ _sum: { actualTenderCost: true } }),
    prisma.tender.aggregate({ _sum: { tenderExpense: true } }),
    prisma.tender.aggregate({
      where: { resultStatus: "WON" },
      _sum: { actualTenderCost: true, quotedRate: true, value: true },
    }),
  ]);

  const cards = [
    { label: "Total tenders", value: totalTenders },
    { label: "Bid submitted", value: `${bidTenders} (${percent(bidTenders, totalTenders)})` },
    { label: "Not bid", value: `${notBidTenders} (${percent(notBidTenders, totalTenders)})` },
    { label: "Won tenders", value: wonTenders },
    { label: "Work completed", value: completedWorks },
    { label: "Certificates received", value: certificateReceived },
  ];

  const wonTotal =
    wonAmount._sum.actualTenderCost ?? wonAmount._sum.quotedRate ?? wonAmount._sum.value ?? 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          Tender analytics
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Reports</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Review all tenders, bids, quoted values, awarded work, completion, and certificate status.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="rounded-md bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">{card.label}</p>
            <p className="mt-3 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-md border-l-4 border-l-blue-600 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Total estimated tender value</p>
          <p className="mt-3 text-2xl font-bold">₹ {money(estimated._sum.value)}</p>
        </div>
        <div className="rounded-md border-l-4 border-l-slate-700 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Total quoted rate/value</p>
          <p className="mt-3 text-2xl font-bold">₹ {money(quoted._sum.quotedRate)}</p>
        </div>
        <div className="rounded-md border-l-4 border-l-amber-500 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Total actual tendered cost</p>
          <p className="mt-3 text-2xl font-bold">₹ {money(actual._sum.actualTenderCost)}</p>
        </div>
        <div className="rounded-md border-l-4 border-l-rose-500 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Total tender expenses</p>
          <p className="mt-3 text-2xl font-bold">₹ {money(expenses._sum.tenderExpense)}</p>
        </div>
        <div className="rounded-md border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Total work won/get</p>
          <p className="mt-3 text-2xl font-bold">₹ {money(wonTotal)}</p>
        </div>
      </section>

      <section className="mt-6 rounded-md bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">All tender records</h2>
            <p className="text-sm text-slate-600">
              Opening, closing, bid decision, quoted amount, work completion, and certificate status.
            </p>
          </div>
          <a
            href="/tenders"
            className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Update records
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="border-y border-l border-slate-200 px-3 py-3">Tender</th>
                <th className="border-y border-slate-200 px-3 py-3">Open</th>
                <th className="border-y border-slate-200 px-3 py-3">Close</th>
                <th className="border-y border-slate-200 px-3 py-3">Bid</th>
                <th className="border-y border-slate-200 px-3 py-3">Docs</th>
                <th className="border-y border-slate-200 px-3 py-3">Quoted</th>
                <th className="border-y border-slate-200 px-3 py-3">Actual cost</th>
                <th className="border-y border-slate-200 px-3 py-3">Result</th>
                <th className="border-y border-r border-slate-200 px-3 py-3">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {tenders.map((tender) => (
                <tr key={tender.id}>
                  <td className="border-b border-l border-slate-200 px-3 py-3">
                    <p className="font-semibold">{tender.title}</p>
                    <p className="text-slate-500">{tender.department}</p>
                  </td>
                  <td className="border-b border-slate-200 px-3 py-3">
                    {tender.startDate.toLocaleDateString("en-IN")}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-3">
                    {tender.endDate.toLocaleDateString("en-IN")}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-3">{tender.bidDecision}</td>
                  <td className="border-b border-slate-200 px-3 py-3">
                    {tender.documentPrepared ? "Prepared" : "Pending"}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-3">₹ {money(tender.quotedRate)}</td>
                  <td className="border-b border-slate-200 px-3 py-3">
                    ₹ {money(tender.actualTenderCost)}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-3">{tender.resultStatus}</td>
                  <td className="border-b border-r border-slate-200 px-3 py-3">
                    {tender.workDoneCertificate ? "Received" : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
