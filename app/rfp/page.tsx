"use client";

import { useEffect, useMemo, useState } from "react";

type RfpAnalysis = {
  id: string;
  fileName: string;
  tenderTitle?: string | null;
  summary?: string | null;
  liveDate?: string | null;
  openingDate?: string | null;
  submissionDate?: string | null;
  lastDate?: string | null;
  eligibility?: string | null;
  evaluationMethod?: string | null;
  markingSystem?: string | null;
  requiredDocuments?: string | null;
  physicalSubmission?: string | null;
  emdAmount?: string | null;
  tenderFee?: string | null;
  similarWork?: string | null;
  keyCriteria?: string | null;
  createdAt: string;
};

const emptyText = "Not clearly found in uploaded PDF.";

function FieldCard({
  code,
  label,
  value,
  tone = "blue",
}: {
  code: string;
  label: string;
  value?: string | null;
  tone?: "blue" | "emerald" | "amber" | "rose" | "slate";
}) {
  const tones = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-sm font-black ${tones[tone]}`}
        >
          {code}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-900">
            {value?.trim() || emptyText}
          </p>
        </div>
      </div>
    </div>
  );
}

function TextPanel({
  title,
  value,
  code,
}: {
  title: string;
  value?: string | null;
  code: string;
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-xs font-black text-white">
          {code}
        </span>
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
      </div>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
        {value?.trim() || emptyText}
      </p>
    </section>
  );
}

export default function RfpPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyses, setAnalyses] = useState<RfpAnalysis[]>([]);
  const [activeId, setActiveId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");

  const activeAnalysis = useMemo(
    () => analyses.find((analysis) => analysis.id === activeId) ?? analyses[0],
    [activeId, analyses],
  );

  async function loadAnalyses() {
    const response = await fetch("/api/rfp/analyses");
    if (response.ok) {
      const data = (await response.json()) as RfpAnalysis[];
      setAnalyses(data);
      setActiveId((current) => current || data[0]?.id || "");
    }
  }

  useEffect(() => {
    loadAnalyses();
  }, []);

  useEffect(() => {
    if (!busy) return;

    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = current < 35 ? current + 7 : current < 70 ? current + 4 : current + 2;
        const capped = Math.min(next, 92);

        if (capped < 25) setProgressStage("Uploading RFP file...");
        else if (capped < 50) setProgressStage("Reading PDF text...");
        else if (capped < 75) setProgressStage("Finding dates, fees, EMD and criteria...");
        else setProgressStage("Preparing and saving report...");

        return capped;
      });
    }, 700);

    return () => window.clearInterval(timer);
  }, [busy]);

  async function analyzeFile(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setMessage("Please select one RFP PDF first.");
      return;
    }

    setBusy(true);
    setProgress(8);
    setProgressStage("Uploading RFP file...");
    setMessage("Analysis started. Please keep this page open.");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/rfp/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      setBusy(false);
      setProgress(0);
      setProgressStage("");
      setMessage(data.error || "Could not analyze this PDF.");
      return;
    }

    setAnalyses((current) => [data, ...current.filter((item) => item.id !== data.id)]);
    setActiveId(data.id);
    setFile(null);
    setProgress(100);
    setProgressStage("Report ready.");
    window.setTimeout(() => {
      setBusy(false);
      setProgress(0);
      setProgressStage("");
    }, 900);
    setMessage("RFP summary is ready. You can export it as PDF.");
  }

  function exportPdf() {
    window.print();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          aside,
          header,
          .no-print {
            display: none !important;
          }

          main {
            max-width: none !important;
            padding: 0 !important;
          }

          .print-report {
            box-shadow: none !important;
            border: 0 !important;
          }
        }
      `}</style>

      <div className="no-print mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          Tender document intelligence
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">RFP Analyzer</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Upload a tender RFP PDF and get key dates, eligibility, EMD, tender fee, documents,
          evaluation method, and bid criteria in one clean report.
        </p>
      </div>

      <section className="no-print grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={analyzeFile} className="h-fit rounded-md bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Upload RFP PDF</h2>
          <p className="mt-1 text-sm text-slate-600">
            Best result comes from searchable PDF files, not scanned images.
          </p>

          <label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-blue-200 bg-blue-50 px-4 py-6 text-center hover:border-blue-500">
            <span className="text-sm font-bold text-blue-800">
              {file ? file.name : "Choose RFP PDF file"}
            </span>
            <span className="mt-1 text-xs text-blue-700">PDF only</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {message && (
            <p className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-medium text-blue-900">
              {message}
            </p>
          )}

          {(busy || progress > 0) && (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-800">{progressStage}</p>
                <p className="text-sm font-black text-blue-700">{progress}%</p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Large RFP PDFs can take longer. The report will appear here automatically when ready.
              </p>
            </div>
          )}

          <button
            className="mt-5 w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={busy}
          >
            {busy ? "Analyzing..." : "Analyze RFP"}
          </button>
        </form>

        <div className="rounded-md bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Saved RFP reports</h2>
              <p className="text-sm text-slate-600">{analyses.length} report(s)</p>
            </div>
            {activeAnalysis && (
              <button
                type="button"
                onClick={exportPdf}
                className="rounded-md border border-blue-600 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                Export PDF
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-2">
            {analyses.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No RFP uploaded yet.
              </p>
            ) : (
              analyses.map((analysis) => (
                <button
                  key={analysis.id}
                  type="button"
                  onClick={() => setActiveId(analysis.id)}
                  className={`rounded-md border p-3 text-left text-sm ${
                    activeAnalysis?.id === analysis.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="block font-bold text-slate-950">
                    {analysis.tenderTitle || analysis.fileName}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {analysis.fileName} | {new Date(analysis.createdAt).toLocaleString("en-IN")}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {activeAnalysis && (
        <section className="print-report mt-6 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="border-b border-slate-200 pb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
                  Tender Pro RFP Summary
                </p>
                <h2 className="mt-2 break-words text-2xl font-black tracking-tight text-slate-950">
                  {activeAnalysis.tenderTitle || activeAnalysis.fileName}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Source file: {activeAnalysis.fileName}
                </p>
              </div>
              <div className="rounded-md bg-slate-950 px-4 py-3 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Generated
                </p>
                <p className="text-sm font-bold">
                  {new Date(activeAnalysis.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-5xl text-sm leading-6 text-slate-700">
              {activeAnalysis.summary || emptyText}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <FieldCard code="LD" label="Live / Publish Date" value={activeAnalysis.liveDate} />
            <FieldCard code="BO" label="Opening Date" value={activeAnalysis.openingDate} tone="emerald" />
            <FieldCard code="BS" label="Submission Date" value={activeAnalysis.submissionDate} tone="amber" />
            <FieldCard code="CL" label="Last / Closing Date" value={activeAnalysis.lastDate} tone="rose" />
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <FieldCard
              code="EV"
              label="Evaluation Method"
              value={activeAnalysis.evaluationMethod}
              tone="slate"
            />
            <FieldCard code="EMD" label="EMD Amount" value={activeAnalysis.emdAmount} tone="amber" />
            <FieldCard code="TF" label="Tender Fee" value={activeAnalysis.tenderFee} tone="blue" />
            <FieldCard
              code="PHY"
              label="Physical Document Submission"
              value={activeAnalysis.physicalSubmission}
              tone="rose"
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <TextPanel title="Eligibility Criteria" code="EL" value={activeAnalysis.eligibility} />
            <TextPanel title="Marking System" code="MK" value={activeAnalysis.markingSystem} />
            <TextPanel title="Required Documents" code="DC" value={activeAnalysis.requiredDocuments} />
            <TextPanel title="Similar Work Criteria" code="SW" value={activeAnalysis.similarWork} />
          </div>

          <div className="mt-4">
            <TextPanel title="Other Key Tender Criteria" code="KC" value={activeAnalysis.keyCriteria} />
          </div>
        </section>
      )}
    </main>
  );
}
