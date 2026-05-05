"use client";

import { useEffect, useState } from "react";

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", url: "" });

  async function loadSources() {
    const res = await fetch("/api/sources");
    const data = await res.json();
    setSources(data);
  }

  useEffect(() => {
    loadSources();
  }, []);

  async function addSource(e: any) {
    e.preventDefault();

    await fetch("/api/sources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({ name: "", url: "" });
    loadSources();
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Tender Sources</h1>
      <p className="text-gray-600 mb-6">
        Add tender portals like GeM, CPPP, and state eProcurement websites.
      </p>

      <form onSubmit={addSource} className="grid gap-4 bg-white border rounded-xl p-5 mb-8">
        <h2 className="text-xl font-semibold">Add Online Tender Source</h2>

        <input
          className="border p-3 rounded"
          placeholder="Source Name e.g. CPPP"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          className="border p-3 rounded"
          placeholder="Website URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          required
        />

        <button className="bg-black text-white p-3 rounded font-semibold">
          Save Source
        </button>
      </form>

      <div className="grid gap-3">
        {sources.map((source) => (
          <div key={source.id} className="border rounded-xl p-4 bg-white">
            <h3 className="font-bold text-lg">{source.name}</h3>
            <p className="text-sm text-gray-600">{source.url}</p>
          </div>
        ))}
      </div>
    </main>
  );
}