"use client";

import { useEffect, useState } from "react";

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

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [liveTenders, setLiveTenders] = useState<ExternalTender[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchMessage, setFetchMessage] = useState("");
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
    setFetchMessage("Checking sources...");

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
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Online monitoring
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Live Tender Sources</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Connect public tender portals, fetch newly published tender links, and store alerts for review.
          </p>
        </div>
        <button
          onClick={() => fetchLiveTenders()}
          disabled={isFetching || sources.length === 0}
          className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isFetching ? "Fetching..." : "Fetch all live tenders"}
        </button>
      </div>

      {fetchMessage && (
        <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-950">
          {fetchMessage}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <form onSubmit={addSource} className="rounded-md bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Add tender portal</h2>
            <p className="mt-1 text-sm text-slate-600">
              Use public listing pages, RSS feeds, or JSON API URLs from tender websites.
            </p>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Source name
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                  placeholder="CPPP, GeM, State eProcurement"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>

              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Website or feed URL
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                  placeholder="https://..."
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  required
                />
              </label>

              <button className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                Save source
              </button>
            </div>
          </form>

          <div className="rounded-md bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Configured sources</h2>
            <div className="mt-4 grid gap-3">
              {sources.length === 0 ? (
                <p className="text-sm text-slate-500">No sources added yet.</p>
              ) : (
                sources.map((source) => (
                  <div key={source.id} className="rounded-md border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{source.name}</p>
                        <p className="mt-1 break-all text-sm text-slate-600">{source.url}</p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                          {source._count?.externalTenders ?? 0} saved tender(s)
                        </p>
                      </div>
                      <button
                        onClick={() => fetchLiveTenders(source.id)}
                        disabled={isFetching}
                        className="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                      >
                        Fetch
                      </button>
                    </div>
                    {source.lastFetchedAt && (
                      <p className="mt-3 text-xs text-slate-500">
                        Last checked {new Date(source.lastFetchedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-md bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Fetched live tenders</h2>
              <p className="mt-1 text-sm text-slate-600">
                New items are saved once and also added to notifications.
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {liveTenders.length} total
            </span>
          </div>

          <div className="grid gap-3">
            {liveTenders.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Add a source and click fetch to collect live tender links.
              </p>
            ) : (
              liveTenders.map((tender) => (
                <a
                  key={tender.id}
                  href={tender.link}
                  target="_blank"
                  className="block rounded-md border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{tender.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{tender.source.name}</p>
                    </div>
                    <span className="w-fit rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                      {tender.status}
                    </span>
                  </div>
                  <p className="mt-3 break-all text-xs text-slate-500">{tender.link}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Fetched {new Date(tender.fetchedAt).toLocaleString()}
                  </p>
                </a>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
