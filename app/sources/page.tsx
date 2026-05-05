"use client";

import { useEffect, useState } from "react";

type Source = {
  id: string;
  name: string;
  url: string;
  lastFetchedAt?: string | null;
  _count?: { externalTenders: number };
};

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchMessage, setFetchMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    url: "",
  });

  async function loadSources() {
    const res = await fetch("/api/sources");
    setSources(await res.json());
  }

  useEffect(() => {
    loadSources();
  }, []);

  async function addSource(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({ name: "", url: "" });
    loadSources();
  }

  async function fetchSource(sourceId: string) {
    setIsFetching(true);
    setFetchMessage("Checking tender source...");

    const res = await fetch("/api/sources/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId }),
    });

    const data = await res.json();
    const errorText = data.errors?.length ? ` Errors: ${data.errors.join("; ")}` : "";
    setFetchMessage(`Checked ${data.checked} source(s). Added ${data.added} new tender(s).${errorText}`);
    setIsFetching(false);
    loadSources();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          Tender source setup
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Live Sources</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Add tender portals here. Use Open for captcha-based sites like MahaTender, and Fetch for sources that allow automatic access.
        </p>
      </div>

      {fetchMessage && (
        <div className="mb-5 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-950">
          {fetchMessage}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={addSource} className="h-fit rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Add tender portal</h2>
          <p className="mt-1 text-sm text-slate-600">
            Save official tender websites, RSS feeds, or API URLs.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Source name
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                placeholder="MahaTender, CPPP, GeM"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Website URL
              <input
                className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
              />
            </label>

            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
              Save Source
            </button>
          </div>
        </form>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Tender sources</h2>
              <p className="text-sm text-slate-600">{sources.length} source(s) added</p>
            </div>
          </div>

          <div className="grid gap-3">
            {sources.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No sources added yet.
              </p>
            ) : (
              sources.map((source) => (
                <div key={source.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950">{source.name}</p>
                      <p className="mt-1 break-all text-sm text-slate-600">{source.url}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase">
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">
                          {source._count?.externalTenders ?? 0} saved tenders
                        </span>
                        {source.lastFetchedAt && (
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                            Last checked {new Date(source.lastFetchedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <a
                        href={source.url}
                        target="_blank"
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Open
                      </a>
                      <button
                        onClick={() => fetchSource(source.id)}
                        disabled={isFetching}
                        className="rounded-md border border-blue-500 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-400"
                      >
                        {isFetching ? "Fetching" : "Fetch"}
                      </button>
                    </div>
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
