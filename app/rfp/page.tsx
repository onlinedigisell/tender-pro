"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildRiskScore,
  matchEligibility,
  riskTone,
  type EligibilityCheck,
  type RiskScore,
} from "../../lib/intelligence";

type RfpAnalysis = {
  id: string;
  fileName: string;
  tenderTitle?: string | null;
  department?: string | null;
  tenderValue?: string | null;
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
  technicalRequirements?: string | null;
  financialRequirements?: string | null;
  importantClauses?: string | null;
  riskyClauses?: string | null;
  keyCriteria?: string | null;
  createdAt: string;
};

const emptyText = "Not clearly found in uploaded PDF.";
const allowedTypes = ["application/pdf"];

function InfoCard({
  label,
  value,
  code,
  tone = "blue",
}: {
  label: string;
  value?: string | null;
  code: string;
  tone?: "blue" | "emerald" | "amber" | "rose" | "slate";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-xs font-black ${tones[tone]}`}>
          {code}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 break-words text-sm font-bold leading-6 text-slate-950">
            {value?.trim() || emptyText}
          </p>
        </div>
      </div>
    </div>
  );
}

function TextPanel({ title, value, code }: { title: string; value?: string | null; code: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-xs font-black text-white">
          {code}
        </span>
        <h2 className="text-base font-black text-slate-950">{title}</h2>
      </div>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
        {value?.trim() || emptyText}
      </p>
    </section>
  );
}

function RiskPanel({ risk }: { risk: RiskScore }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-700">Risk Assessment</p>
          <h2 className="mt-1 text-2xl font-black">Tender Risk Score: {risk.score}/100</h2>
          <p className="mt-2 text-sm text-slate-600">
            Go / No-Go recommendation: <span className="font-black text-slate-950">{risk.recommendation}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center sm:min-w-64">
          <div className={`rounded-md border p-3 ${riskTone(risk.level)}`}>
            <p className="text-xs font-bold uppercase">Risk</p>
            <p className="mt-1 text-lg font-black">{risk.level}</p>
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-blue-700">
            <p className="text-xs font-bold uppercase">Viability</p>
            <p className="mt-1 text-lg font-black">{risk.viabilityScore}/100</p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {risk.categories.map((item) => (
          <div key={item.name} className="rounded-md border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-slate-950">{item.name}</p>
              <span className={`rounded-md border px-2 py-1 text-xs font-black ${riskTone(item.severity)}`}>
                {item.severity}
              </span>
            </div>
            <p className="mt-2 text-sm leading-5 text-slate-600">{item.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EligibilityTable({ checks }: { checks: EligibilityCheck[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-black text-slate-950">Eligibility Matcher</h2>
      <p className="mt-1 text-sm text-slate-600">
        Company documents mapped against extracted tender eligibility.
      </p>
      <div className="mt-4 grid gap-2">
        {checks.map((check) => (
          <div key={check.document} className="grid gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-[180px_170px_1fr] sm:items-center">
            <p className="font-bold text-slate-900">{check.document}</p>
            <span
              className={`w-fit rounded-md px-2 py-1 text-xs font-black ${
                check.status === "Pass"
                  ? "bg-emerald-50 text-emerald-700"
                  : check.status === "Missing document" || check.status === "Fail"
                    ? "bg-rose-50 text-rose-700"
                    : check.status === "JV/partner required"
                      ? "bg-purple-50 text-purple-700"
                      : "bg-amber-50 text-amber-700"
              }`}
            >
              {check.status}
            </span>
            <p className="text-sm text-slate-600">{check.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RfpPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [analyses, setAnalyses] = useState<RfpAnalysis[]>([]);
  const [activeId, setActiveId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const activeAnalysis = useMemo(
    () => analyses.find((analysis) => analysis.id === activeId) ?? analyses[0],
    [activeId, analyses],
  );
  const risk = activeAnalysis ? buildRiskScore(activeAnalysis) : null;
  const eligibilityChecks = activeAnalysis ? matchEligibility(activeAnalysis.eligibility) : [];

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
        const next = current < 30 ? current + 6 : current < 70 ? current + 4 : current + 2;
        const capped = Math.min(next, 92);
        if (capped < 25) setProgressStage("Uploading tender documents...");
        else if (capped < 50) setProgressStage("Reading NIT, BOQ, specs and bid documents...");
        else if (capped < 75) setProgressStage("Extracting dates, fees, eligibility and clauses...");
        else setProgressStage("Scoring risk and saving intelligence report...");
        return capped;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [busy]);

  function addFiles(selected: FileList | File[]) {
    const nextFiles = Array.from(selected);
    const invalid = nextFiles.find((file) => !allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf"));
    const tooLarge = nextFiles.find((file) => file.size > 25 * 1024 * 1024);

    if (invalid) {
      setMessage("Only PDF files are supported right now.");
      return;
    }
    if (tooLarge) {
      setMessage("Each file must be below 25 MB.");
      return;
    }

    setFiles((current) => {
      const map = new Map(current.map((file) => [`${file.name}-${file.size}`, file]));
      nextFiles.forEach((file) => map.set(`${file.name}-${file.size}`, file));
      return Array.from(map.values());
    });
    setMessage("");
  }

  async function analyzeFile(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setMessage("Please upload NIT/RFP PDF first.");
      return;
    }

    setBusy(true);
    setProgress(8);
    setProgressStage("Uploading tender documents...");
    setMessage("Analysis started. Keep this page open.");

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/rfp/analyze", { method: "POST", body: formData });
    const data = await response.json();

    if (!response.ok) {
      setBusy(false);
      setProgress(0);
      setProgressStage("");
      setMessage(data.error || "Could not analyze these documents.");
      return;
    }

    setAnalyses((current) => [data, ...current.filter((item) => item.id !== data.id)]);
    setActiveId(data.id);
    setFiles([]);
    setProgress(100);
    setProgressStage("Intelligence report ready.");
    window.setTimeout(() => {
      setBusy(false);
      setProgress(0);
      setProgressStage("");
    }, 900);
    setMessage("RFP intelligence report is ready. You can export it as PDF.");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 lg:px-8">
      <style jsx global>{`
        @media print {
          aside,
          header,
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
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

      <div className="no-print mb-6 rounded-xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-black uppercase tracking-wider text-blue-700">AI Tender Intelligence</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">RFP Analyzer</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Upload NIT, corrigendum, BOQ, technical specifications, and financial bid documents to
          generate bid readiness, eligibility review, risk assessment, and critical deadline intelligence.
        </p>
      </div>

      <section className="no-print grid gap-5 lg:grid-cols-[430px_minmax(0,1fr)]">
        <form onSubmit={analyzeFile} className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">Document Upload</h2>
          <p className="mt-1 text-sm text-slate-600">PDF files only. Upload multiple tender documents together.</p>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center ${
              dragActive ? "border-blue-600 bg-blue-50" : "border-blue-200 bg-slate-50 hover:border-blue-500"
            }`}
          >
            <span className="text-base font-black text-slate-950">Drag and drop tender PDFs</span>
            <span className="mt-1 text-sm text-slate-600">NIT, corrigendum, BOQ, technical specs, financial bid docs</span>
            <span className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white">Choose files</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="sr-only"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </label>

          {files.length > 0 && (
            <div className="mt-4 grid gap-2">
              {files.map((file) => (
                <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                    className="rounded-md border border-rose-200 px-2 py-1 text-xs font-bold text-rose-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

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
                Large tender PDFs can take longer. The report appears automatically when ready.
              </p>
            </div>
          )}

          <button
            className="mt-5 w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={busy}
          >
            {busy ? "Analyzing tender documents..." : "Generate RFP Intelligence"}
          </button>
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black">Saved Intelligence Reports</h2>
              <p className="text-sm text-slate-600">{analyses.length} report(s)</p>
            </div>
            {activeAnalysis && (
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-md border border-blue-600 px-4 py-2 text-sm font-black text-blue-700 hover:bg-blue-50"
              >
                Export PDF
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-2">
            {analyses.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No RFP analysis yet. Upload tender documents to create your first intelligence report.
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
                  <span className="block font-black text-slate-950">{analysis.tenderTitle || analysis.fileName}</span>
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
        <section className="print-report mt-6 grid gap-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-sm font-black uppercase tracking-wider text-blue-700">Tender Pro RFP Intelligence</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  {activeAnalysis.tenderTitle || activeAnalysis.fileName}
                </h2>
                <p className="mt-2 text-sm text-slate-500">Source files: {activeAnalysis.fileName}</p>
              </div>
              <div className="rounded-md bg-slate-950 px-4 py-3 text-white">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Generated</p>
                <p className="text-sm font-black">{new Date(activeAnalysis.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
            <p className="mt-5 max-w-5xl text-sm leading-6 text-slate-700">{activeAnalysis.summary || emptyText}</p>
          </div>

          {risk && <RiskPanel risk={risk} />}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard code="TV" label="Tender Value" value={activeAnalysis.tenderValue} tone="slate" />
            <InfoCard code="EMD" label="EMD" value={activeAnalysis.emdAmount} tone="amber" />
            <InfoCard code="TF" label="Tender Fee" value={activeAnalysis.tenderFee} tone="blue" />
            <InfoCard code="EV" label="Evaluation Criteria" value={activeAnalysis.evaluationMethod} tone="emerald" />
            <InfoCard code="SD" label="Submission Deadline" value={activeAnalysis.submissionDate || activeAnalysis.lastDate} tone="rose" />
            <InfoCard code="BO" label="Bid Opening Date" value={activeAnalysis.openingDate} tone="emerald" />
            <InfoCard code="CL" label="Client / Department" value={activeAnalysis.department} tone="blue" />
            <InfoCard code="PHY" label="Physical Submission" value={activeAnalysis.physicalSubmission} tone="rose" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TextPanel title="Eligibility Criteria" code="EL" value={activeAnalysis.eligibility} />
            <TextPanel title="Required Documents" code="DC" value={activeAnalysis.requiredDocuments} />
            <TextPanel title="Technical Requirements" code="TR" value={activeAnalysis.technicalRequirements} />
            <TextPanel title="Financial Requirements" code="FR" value={activeAnalysis.financialRequirements} />
            <TextPanel title="Marking System" code="MK" value={activeAnalysis.markingSystem} />
            <TextPanel title="Similar Work Criteria" code="SW" value={activeAnalysis.similarWork} />
            <TextPanel title="Important Clauses" code="IC" value={activeAnalysis.importantClauses} />
            <TextPanel title="Risky / Ambiguous Clauses" code="RC" value={activeAnalysis.riskyClauses} />
          </div>

          <EligibilityTable checks={eligibilityChecks} />
        </section>
      )}
    </main>
  );
}
