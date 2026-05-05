"use client";

import { useEffect, useMemo, useState } from "react";

type Source = {
  id: string;
  name: string;
  url: string;
  lastFetchedAt?: string | null;
  _count?: { externalTenders: number };
};

type ExternalTender = {
  id: string;
  title: string;
  link: string;
  status: string;
  fetchedAt: string;
  source: { name: string; url: string };
};

const filters = ["Saved Filters", "Keyword", "Authority", "Category", "State", "City", "Tender Amount", "More Filters"];

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [liveTenders, setLiveTenders] = useState<ExternalTender[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchMessage, setFetchMessage] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    url: "",
  });

  async function loadData() {
    const [sourcesRes, tendersRes] = await Promise.all([
      fetch("/api/sources"),
      fetch("/api/live-tenders"),
    ]);

    setSources(await sourcesRes.json());
    setLiveTenders(await tendersRes.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredTenders = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return liveTenders;

    return liveTenders.filter((tender) =>
      `${tender.title} ${tender.source.name} ${tender.link}`.toLowerCase().includes(value),
    );
  }, [liveTenders, search]);

  async function addSource(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({ name: "", url: "" });
    loadData();
  }

  async function fetchLiveTenders(sourceId?: string) {
    setIsFetching(true);
    setFetchMessage("Checking tender portals...");

    const res = await fetch("/api/sources/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId }),
    });

    const data = await res.json();
    const errorText = data.errors?.length ? ` Errors: ${data.errors.join("; ")}` : "";
    setFetchMessage(`Checked ${data.checked} source(s). Added ${data.added} new tender(s).${errorText}`);
    setIsFetching(false);
    loadData();
  }

  return (
    <main>
      <section className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 px-4 py-5 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">TenderPro</h1>
            <p className="mt-1 text-sm font-medium text-cyan-50">Latest tender discovery and source monitoring</p>
          </div>

          <div className="flex w-full max-w-2xl rounded-lg bg-white p-1 shadow-lg">
            <input
              className="min-w-0 flex-1 rounded-md px-4 py-3 text-sm text-slate-900 outline-none"
              placeholder="Type keyword eg-cpwd, gem, road, electrical..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => fetchLiveTenders()}
              disabled={isFetching || sources.length === 0}
              className="rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              {isFetching ? "Fetching" : "Search"}
            </button>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto text-sm font-bold">
          {["Indian Tenders", "Tender Results", "Global Tenders", "Global Tender Results"].map((tab, index) => (
            <span
              key={tab}
              className={`whitespace-nowrap border-b-3 px-1 py-4 ${
                index === 0 ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              className="rounded-md border border-blue-500 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              {filter}
            </button>
          ))}
          <button
            onClick={() => fetchLiveTenders()}
            disabled={isFetching || sources.length === 0}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            Save Filter
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-4 text-sm text-slate-600">
          Home / Indian Tenders / <span className="font-semibold text-slate-900">Active Tenders</span>
        </div>

        <div className="mb-4 rounded-md border border-slate-200 bg-white">
          <div className="flex gap-8 px-5 text-sm font-semibold">
            <span className="border-b-4 border-blue-600 py-4 text-blue-700">
              Active ({filteredTenders.length})
            </span>
            <span className="py-4 text-blue-700">Archived</span>
            <span className="py-4 text-blue-700">Followed</span>
          </div>
        </div>

        {fetchMessage && (
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-950">
            {fetchMessage}
          </div>
        )}

        <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
          <div className="space-y-4">
            <form onSubmit={addSource} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Add tender portal</h2>
              <p className="mt-1 text-sm text-slate-600">Add CPPP, GeM, state eProcurement pages, RSS or API URLs.</p>

              <div className="mt-5 grid gap-4">
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                  placeholder="Source Name e.g. CPPP"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                  placeholder="Website URL"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  required
                />
                <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                  Save Source
                </button>
              </div>
            </form>

            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">Tender Sources</h2>
              <div className="mt-4 grid gap-3">
                {sources.length === 0 ? (
                  <p className="text-sm text-slate-500">No sources added yet.</p>
                ) : (
                  sources.map((source) => (
                    <div key={source.id} className="rounded-md border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold">{source.name}</p>
                          <p className="mt-1 break-all text-xs text-slate-500">{source.url}</p>
                          <p className="mt-2 text-xs font-bold uppercase text-blue-700">
                            {source._count?.externalTenders ?? 0} saved tender(s)
                          </p>
                        </div>
                        <button
                          onClick={() => fetchLiveTenders(source.id)}
                          disabled={isFetching}
                          className="rounded-md border border-blue-500 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
                        >
                          Fetch
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTenders.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                Add a source and click Search/Fetch to collect live tender links.
              </p>
            ) : (
              filteredTenders.map((tender) => (
                <article key={tender.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-slate-950">{tender.title}</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {tender.source.name}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          Latest tender
                        </span>
                        <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">
                          AI Insights Available
                        </span>
                      </div>
                      <p className="mt-4 break-words text-sm leading-6 text-slate-600">{tender.link}</p>
                      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                        <div>
                          <p className="text-slate-500">Location</p>
                          <p className="font-semibold text-slate-950">India</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Fetched Date</p>
                          <p className="font-semibold text-slate-950">
                            {new Date(tender.fetchedAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Status</p>
                          <p className="font-semibold text-orange-600">{tender.status}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2 lg:self-end">
                      <a
                        href={tender.link}
                        target="_blank"
                        className="rounded-md border border-blue-600 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
                      >
                        Follow
                      </a>
                      <a
                        href={tender.link}
                        target="_blank"
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                </article>
              ))
            )}

            <div className="rounded-md border-t-4 border-blue-600 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xl font-bold text-slate-950">Get Raw Material Quotes</p>
                  <p className="mt-1 text-sm text-slate-600">100+ product categories</p>
                  <button className="mt-4 rounded-md bg-blue-600 px-5 py-2 text-sm font-bold text-white">
                    Get Me Quotes
                  </button>
                </div>
                <div className="rounded-md bg-rose-50 p-4">
                  <p className="font-bold">Wide Range of Brands</p>
                  <p className="mt-1 text-sm text-slate-600">All major brands in each category</p>
                </div>
                <div className="rounded-md bg-emerald-50 p-4">
                  <p className="font-bold">Credit Facilities Available</p>
                  <p className="mt-1 text-sm text-slate-600">Track LC and BG requirements</p>
                </div>
                <div className="rounded-md bg-amber-50 p-4">
                  <p className="font-bold">PAN India Orders</p>
                  <p className="mt-1 text-sm text-slate-600">Record delivery and site details</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
