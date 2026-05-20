"use client";

import { useState } from "react";

export default function MahaTenderPage() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [imported, setImported] = useState<any[]>([]);

  async function importTenders() {
    setBusy(true);
    setMessage("Reading MahaTender text and creating tender records...");
    setImported([]);

    const response = await fetch("/api/mahatender/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    setBusy(false);

    if (!response.ok) {
      setMessage(data.error || "Could not import tenders.");
      return;
    }

    setImported(data.tenders ?? []);
    setMessage(`Imported ${data.imported} tender(s) into Submission Tracker.`);
  }

  return (
    <main className="mx-auto max-w-6xl px-3 py-5 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-black uppercase tracking-wider text-blue-700">
          MahaTender Assisted Import
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Login, solve CAPTCHA, paste tender data here
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Tender Pro will not store your MahaTender password. You login on MahaTender yourself,
          open the tender list or tender detail page, select the text, copy it, and paste it below.
          The app will extract title, department, location, dates, value, and create tender records.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">Step by step</h2>
          <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
            <li className="rounded-md bg-slate-50 p-3">
              1. Open MahaTender and login with your ID.
            </li>
            <li className="rounded-md bg-slate-50 p-3">
              2. You fill CAPTCHA/OTP manually.
            </li>
            <li className="rounded-md bg-slate-50 p-3">
              3. Open tender search result or tender detail page.
            </li>
            <li className="rounded-md bg-slate-50 p-3">
              4. Press Ctrl+A then Ctrl+C on the tender table/detail area.
            </li>
            <li className="rounded-md bg-slate-50 p-3">
              5. Paste here and click Import.
            </li>
          </ol>
          <a
            href="/tenders"
            className="mt-5 inline-flex rounded-md border border-blue-600 px-4 py-2 text-sm font-black text-blue-700 hover:bg-blue-50"
          >
            View Submission Tracker
          </a>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black">Paste MahaTender text</h2>
              <p className="text-sm text-slate-600">
                Works best with tender detail page or search result table copied after login.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setText("")}
              className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-50"
            >
              Clear
            </button>
          </div>

          <textarea
            className="mt-4 min-h-[320px] w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-600"
            placeholder="Paste copied MahaTender tender list or tender details here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {message && (
            <p className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-bold text-blue-900">
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={importTenders}
            disabled={busy}
            className="mt-4 w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {busy ? "Importing..." : "Import to Submission Tracker"}
          </button>

          {imported.length > 0 && (
            <div className="mt-5 grid gap-3">
              <h3 className="font-black">Imported tenders</h3>
              {imported.map((tender) => (
                <div key={tender.id} className="rounded-md border border-slate-200 p-3">
                  <p className="font-bold text-slate-950">{tender.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {tender.department} | Closing:{" "}
                    {new Date(tender.endDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
