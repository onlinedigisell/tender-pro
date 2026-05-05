"use client";

import { useEffect, useMemo, useState } from "react";

type Tender = {
  id: string;
  title: string;
  department: string;
  endDate: string;
};

type Bidder = {
  id: string;
  tenderId: string;
  bidderName: string;
  contactPerson?: string | null;
  phone?: string | null;
  quotedAmount?: number | null;
  percentBelow?: number | null;
  rank?: number | null;
  isWinner: boolean;
  remarks?: string | null;
  tender: Tender;
};

const emptyForm = {
  tenderId: "",
  bidderName: "",
  contactPerson: "",
  phone: "",
  quotedAmount: "",
  percentBelow: "",
  rank: "",
  isWinner: false,
  remarks: "",
};

function money(value?: number | null) {
  if (!value) return "-";
  return `₹ ${Number(value).toLocaleString("en-IN")}`;
}

export default function BiddersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    const [tendersRes, biddersRes] = await Promise.all([
      fetch("/api/tenders"),
      fetch("/api/bidders"),
    ]);

    setTenders(await tendersRes.json());
    setBidders(await biddersRes.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredBidders = useMemo(() => {
    const value = query.toLowerCase();
    return bidders.filter((bidder) =>
      `${bidder.bidderName} ${bidder.tender.title} ${bidder.tender.department}`
        .toLowerCase()
        .includes(value),
    );
  }, [bidders, query]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function editBidder(bidder: Bidder) {
    setEditingId(bidder.id);
    setForm({
      tenderId: bidder.tenderId,
      bidderName: bidder.bidderName,
      contactPerson: bidder.contactPerson ?? "",
      phone: bidder.phone ?? "",
      quotedAmount: bidder.quotedAmount ? String(bidder.quotedAmount) : "",
      percentBelow: bidder.percentBelow ? String(bidder.percentBelow) : "",
      rank: bidder.rank ? String(bidder.rank) : "",
      isWinner: bidder.isWinner,
      remarks: bidder.remarks ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteBidder(bidder: Bidder) {
    const confirmed = window.confirm(`Delete bidder: ${bidder.bidderName}?`);
    if (!confirmed) return;

    await fetch(`/api/bidders/${bidder.id}`, { method: "DELETE" });
    if (editingId === bidder.id) resetForm();
    loadData();
  }

  async function saveBidder(e: React.FormEvent) {
    e.preventDefault();

    await fetch(editingId ? `/api/bidders/${editingId}` : "/api/bidders", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    resetForm();
    loadData();
  }

  return (
    <main className="mx-auto w-full max-w-7xl overflow-hidden px-3 py-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          Competitor bid tracking
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Bidders</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Store who bid against each tender, quoted amount, percent below, winner, and remarks.
        </p>
      </div>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={saveBidder} className="h-fit rounded-md bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">{editingId ? "Edit bidder" : "Add bidder"}</h2>
              <p className="mt-1 text-sm text-slate-600">Attach bidder to one tender record.</p>
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
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Select tender
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                value={form.tenderId}
                onChange={(e) => setForm({ ...form, tenderId: e.target.value })}
                required
              >
                <option value="">Choose tender</option>
                {tenders.map((tender) => (
                  <option key={tender.id} value={tender.id}>
                    {tender.title}
                  </option>
                ))}
              </select>
            </label>

            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              placeholder="Bidder company name"
              value={form.bidderName}
              onChange={(e) => setForm({ ...form, bidderName: e.target.value })}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                placeholder="Contact person"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              />
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                placeholder="Quoted amount"
                value={form.quotedAmount}
                onChange={(e) => setForm({ ...form, quotedAmount: e.target.value })}
              />
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                placeholder="% below"
                value={form.percentBelow}
                onChange={(e) => setForm({ ...form, percentBelow: e.target.value })}
              />
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                placeholder="Rank"
                value={form.rank}
                onChange={(e) => setForm({ ...form, rank: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isWinner}
                onChange={(e) => setForm({ ...form, isWinner: e.target.checked })}
              />
              This bidder got the tender
            </label>

            <textarea
              className="min-h-24 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              placeholder="Remarks, L1/L2 details, negotiation notes..."
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />

            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
              {editingId ? "Update bidder" : "Save bidder"}
            </button>
          </div>
        </form>

        <div className="min-w-0 rounded-md bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Bidder records</h2>
              <p className="text-sm text-slate-600">{filteredBidders.length} record(s)</p>
            </div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 sm:w-auto"
              placeholder="Search tender or bidder..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="grid gap-3">
            {filteredBidders.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No bidder records found.
              </p>
            ) : (
              filteredBidders.map((bidder) => (
                <article key={bidder.id} className="min-w-0 rounded-md border border-slate-200 p-4">
                  <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words font-bold">{bidder.bidderName}</h3>
                        {bidder.isWinner && (
                          <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                            Winner
                          </span>
                        )}
                      </div>
                      <p className="mt-1 break-words text-sm font-medium text-blue-700">
                        {bidder.tender.title}
                      </p>
                      <p className="mt-1 break-words text-sm text-slate-600">{bidder.tender.department}</p>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <div>
                          <p className="text-slate-500">Quoted</p>
                          <p className="font-semibold">{money(bidder.quotedAmount)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">% Below</p>
                          <p className="font-semibold">
                            {bidder.percentBelow ? `${bidder.percentBelow}%` : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Rank</p>
                          <p className="font-semibold">{bidder.rank ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Tender close</p>
                          <p className="font-semibold">
                            {new Date(bidder.tender.endDate).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                      {bidder.remarks && (
                        <p className="mt-3 break-words text-sm text-slate-600">{bidder.remarks}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:shrink-0">
                      <button
                        type="button"
                        onClick={() => editBidder(bidder)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBidder(bidder)}
                        className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
