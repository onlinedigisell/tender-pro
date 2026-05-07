"use client";

import { useEffect, useMemo, useState } from "react";
import WorkflowTracker from "../components/WorkflowTracker";
import { workflowStageForTender } from "../../lib/intelligence";

type Tender = {
  id: string;
  title: string;
  department: string;
  location: string;
  value?: number | null;
  startDate: string;
  endDate: string;
  status: string;
  onlineLink?: string | null;
  bidDecision: string;
  documentPrepared: boolean;
  bidSubmitted: boolean;
  quotedRate?: number | null;
  actualTenderCost?: number | null;
  tenderExpense?: number | null;
  resultStatus: string;
  workCompleted: boolean;
  workDoneCertificate: boolean;
  completionDate?: string | null;
  notes?: string | null;
  bidders?: {
    id: string;
    bidderName: string;
    quotedAmount?: number | null;
    percentBelow?: number | null;
    isWinner: boolean;
  }[];
  _count?: {
    bidders: number;
  };
};

const emptyForm = {
  title: "",
  department: "",
  location: "",
  value: "",
  startDate: "",
  endDate: "",
  status: "OPEN",
  onlineLink: "",
  bidDecision: "PENDING",
  documentPrepared: false,
  bidSubmitted: false,
  quotedRate: "",
  actualTenderCost: "",
  tenderExpense: "",
  resultStatus: "PENDING",
  workCompleted: false,
  workDoneCertificate: false,
  completionDate: "",
  notes: "",
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700",
  SUBMITTED: "bg-emerald-50 text-emerald-700",
  WON: "bg-green-50 text-green-700",
  LOST: "bg-rose-50 text-rose-700",
};

const bidStyles: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  BID: "bg-emerald-50 text-emerald-700",
  NOT_BID: "bg-rose-50 text-rose-700",
};

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDaysRemaining(endDate: string) {
  const today = startOfLocalDay(new Date());
  const closing = startOfLocalDay(new Date(endDate));
  const diff = closing.getTime() - today.getTime();
  return Math.round(diff / 86400000);
}

function getDeadlineLabel(endDate: string) {
  const days = getDaysRemaining(endDate);

  if (days < 0) return { text: "Overdue", className: "bg-rose-50 text-rose-700" };
  if (days === 0) return { text: "Closes today", className: "bg-amber-50 text-amber-700" };
  if (days === 1) return { text: "1 day left", className: "bg-amber-50 text-amber-700" };
  if (days <= 7) return { text: `${days} days left`, className: "bg-amber-50 text-amber-700" };
  return { text: `${days} days left`, className: "bg-slate-100 text-slate-700" };
}

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadTenders() {
    const res = await fetch("/api/tenders");
    setTenders(await res.json());
  }

  useEffect(() => {
    loadTenders();
  }, []);

  const filteredTenders = useMemo(() => {
    const value = query.toLowerCase();
    return tenders.filter((tender) =>
      `${tender.title} ${tender.department} ${tender.location} ${tender.status}`
        .toLowerCase()
        .includes(value),
    );
  }, [query, tenders]);

  function toDateInput(value: string) {
    return new Date(value).toISOString().slice(0, 10);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function editTender(tender: Tender) {
    setEditingId(tender.id);
    setForm({
      title: tender.title,
      department: tender.department,
      location: tender.location,
      value: tender.value ? String(tender.value) : "",
      startDate: toDateInput(tender.startDate),
      endDate: toDateInput(tender.endDate),
      status: tender.status,
      onlineLink: tender.onlineLink ?? "",
      bidDecision: tender.bidDecision ?? "PENDING",
      documentPrepared: Boolean(tender.documentPrepared),
      bidSubmitted: Boolean(tender.bidSubmitted),
      quotedRate: tender.quotedRate ? String(tender.quotedRate) : "",
      actualTenderCost: tender.actualTenderCost ? String(tender.actualTenderCost) : "",
      tenderExpense: tender.tenderExpense ? String(tender.tenderExpense) : "",
      resultStatus: tender.resultStatus ?? "PENDING",
      workCompleted: Boolean(tender.workCompleted),
      workDoneCertificate: Boolean(tender.workDoneCertificate),
      completionDate: tender.completionDate ? toDateInput(tender.completionDate) : "",
      notes: tender.notes ?? "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteTender(tender: Tender) {
    const confirmed = window.confirm(`Delete tender: ${tender.title}?`);
    if (!confirmed) return;

    await fetch(`/api/tenders/${tender.id}`, {
      method: "DELETE",
    });

    if (editingId === tender.id) {
      resetForm();
    }

    loadTenders();
  }

  async function saveTender(e: React.FormEvent) {
    e.preventDefault();

    await fetch(editingId ? `/api/tenders/${editingId}` : "/api/tenders", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    resetForm();
    loadTenders();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          Submission Tracker
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Tender Workflow Engine</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Maintain tender records from source identified to RFP review, BOQ preparation, bid submission, award, and work order.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={saveTender} className="h-fit rounded-md bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                {editingId ? "Edit tender" : "Add new tender"}
              </h2>
              {editingId && (
                <p className="mt-1 text-sm text-blue-700">
                  Updating saved tender record
                </p>
              )}
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="mt-5 grid gap-4">
            <input
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              placeholder="Tender title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                placeholder="Department / client"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                required
              />
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>

            <input
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              placeholder="Estimated value"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Start date
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Closing date
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </label>
            </div>

            <select
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="OPEN">OPEN</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>

            <input
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              placeholder="Online tender link"
              value={form.onlineLink}
              onChange={(e) => setForm({ ...form, onlineLink: e.target.value })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Bid decision
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                  value={form.bidDecision}
                  onChange={(e) => setForm({ ...form, bidDecision: e.target.value })}
                >
                  <option value="PENDING">Pending</option>
                  <option value="BID">We bid</option>
                  <option value="NOT_BID">Not bid</option>
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Result
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                  value={form.resultStatus}
                  onChange={(e) => setForm({ ...form, resultStatus: e.target.value })}
                >
                  <option value="PENDING">Pending</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                placeholder="Quoted rate"
                value={form.quotedRate}
                onChange={(e) => setForm({ ...form, quotedRate: e.target.value })}
              />
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                placeholder="Actual tendered cost"
                value={form.actualTenderCost}
                onChange={(e) => setForm({ ...form, actualTenderCost: e.target.value })}
              />
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                placeholder="Tender expense"
                value={form.tenderExpense}
                onChange={(e) => setForm({ ...form, tenderExpense: e.target.value })}
              />
            </div>

            <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.documentPrepared}
                  onChange={(e) => setForm({ ...form, documentPrepared: e.target.checked })}
                />
                Documents prepared
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.bidSubmitted}
                  onChange={(e) => setForm({ ...form, bidSubmitted: e.target.checked })}
                />
                Bid submitted
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.workCompleted}
                  onChange={(e) => setForm({ ...form, workCompleted: e.target.checked })}
                />
                Work completed
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.workDoneCertificate}
                  onChange={(e) => setForm({ ...form, workDoneCertificate: e.target.checked })}
                />
                Work done certificate received
              </label>
            </div>

            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Completion date
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                type="date"
                value={form.completionDate}
                onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
              />
            </label>

            <textarea
              className="min-h-24 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              placeholder="Important notes, eligibility, document remarks, reason for not bidding..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              {editingId ? "Update tender" : "Save tender"}
            </button>
          </div>
        </form>

        <div className="rounded-md bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Tender register</h2>
              <p className="text-sm text-slate-600">{filteredTenders.length} record(s)</p>
            </div>
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              placeholder="Search tenders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="overflow-hidden rounded-md border border-slate-200">
            <div className="hidden grid-cols-[1.4fr_0.9fr_90px_90px_110px_120px_150px_120px] gap-4 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 lg:grid">
              <span>Tender</span>
              <span>Department</span>
              <span>Bid</span>
              <span>Docs</span>
              <span>Quoted</span>
              <span>Closing</span>
              <span>Remaining</span>
              <span>Actions</span>
            </div>

            {filteredTenders.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">No tenders found.</p>
            ) : (
              filteredTenders.map((tender) => (
                <div
                  key={tender.id}
                  className="grid gap-2 border-t border-slate-200 px-4 py-4 lg:grid-cols-[1.4fr_0.9fr_90px_90px_110px_120px_150px_120px] lg:items-center lg:gap-4"
                >
                  <div>
                    <p className="font-semibold">{tender.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{tender.location}</p>
                    {tender._count?.bidders ? (
                      <p className="mt-1 text-sm font-medium text-blue-700">
                        {tender._count.bidders} bidder(s)
                        {tender.bidders?.find((bidder) => bidder.isWinner)
                          ? ` . Winner: ${tender.bidders.find((bidder) => bidder.isWinner)?.bidderName}`
                          : ""}
                      </p>
                    ) : null}
                    {tender.value ? (
                      <p className="mt-1 text-sm text-slate-500">
                        Estimated: {Number(tender.value).toLocaleString("en-IN")}
                      </p>
                    ) : null}
                    <div className="mt-4 lg:hidden">
                      <WorkflowTracker currentStage={workflowStageForTender(tender)} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">{tender.department}</p>
                  <span className={`w-fit rounded-md px-2 py-1 text-xs font-bold ${bidStyles[tender.bidDecision] ?? "bg-slate-100 text-slate-700"}`}>
                    {tender.bidDecision}
                  </span>
                  <span className={`w-fit rounded-md px-2 py-1 text-xs font-bold ${tender.documentPrepared ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {tender.documentPrepared ? "Ready" : "Pending"}
                  </span>
                  <p className="text-sm font-medium">
                    {tender.quotedRate ? Number(tender.quotedRate).toLocaleString("en-IN") : "-"}
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(tender.endDate).toLocaleDateString("en-IN")}
                  </p>
                  <span
                    className={`w-fit rounded-md px-2 py-1 text-xs font-bold ${getDeadlineLabel(tender.endDate).className}`}
                  >
                    {getDeadlineLabel(tender.endDate).text}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editTender(tender)}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTender(tender)}
                      className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="hidden lg:col-span-8 lg:block">
                    <WorkflowTracker currentStage={workflowStageForTender(tender)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
