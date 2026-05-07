import { mockBoqAnalysis } from "../../lib/intelligence";

export default function BoqPage() {
  return (
    <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-black uppercase tracking-wider text-blue-700">BOQ Intelligence</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">BOQ Analyzer</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Prepare quantity and rate intelligence before bid submission. This module is ready for
          Excel/PDF BOQ logic and currently shows structured sample analysis for demo workflows.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <div className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">Upload BOQ</h2>
          <p className="mt-1 text-sm text-slate-600">Excel/PDF upload UI prepared for BOQ parsing.</p>
          <label className="mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-slate-50 px-4 py-6 text-center hover:border-blue-500">
            <span className="text-base font-black text-slate-950">Drop BOQ file here</span>
            <span className="mt-1 text-sm text-slate-600">XLSX, XLS, CSV, or PDF</span>
            <span className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white">Choose BOQ</span>
            <input type="file" accept=".xlsx,.xls,.csv,.pdf" className="sr-only" />
          </label>
          <div className="mt-4 rounded-md border border-amber-100 bg-amber-50 p-3 text-sm font-medium text-amber-800">
            Backend BOQ extraction is pending. The interface and data structure are ready.
          </div>
        </div>

        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-rose-100 bg-rose-50 p-5">
              <p className="text-sm font-bold text-rose-700">Abnormal quantities</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{mockBoqAnalysis.abnormalQuantities}</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-5">
              <p className="text-sm font-bold text-amber-700">Risky line items</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{mockBoqAnalysis.riskyLineItems.length}</p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm font-bold text-blue-700">Manual review items</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{mockBoqAnalysis.manualReviewItems.length}</p>
            </div>
          </div>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">Rate and Quantity Flags</h2>
            <div className="mt-4 grid gap-3">
              {mockBoqAnalysis.riskyLineItems.map((item) => (
                <div key={item} className="rounded-md border border-slate-200 p-3 text-sm font-semibold text-slate-800">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">Estimated Margin Zones</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {mockBoqAnalysis.marginZones.map((zone) => (
                <div key={zone.zone} className="rounded-md border border-slate-200 p-4">
                  <p className="font-black text-slate-950">{zone.zone}</p>
                  <p className="mt-2 text-2xl font-black text-blue-700">{zone.margin}</p>
                  <p className="mt-2 text-sm leading-5 text-slate-600">{zone.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">Items Needing Manual Review</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {mockBoqAnalysis.manualReviewItems.map((item) => (
                <span key={item} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
