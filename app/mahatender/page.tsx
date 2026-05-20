"use client";

import { useEffect, useMemo, useState } from "react";

export default function MahaTenderPage() {
  const [origin, setOrigin] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [imported, setImported] = useState<any[]>([]);

  useEffect(() => {
    setOrigin(window.location.origin);
    const params = new URLSearchParams(window.location.search);
    if (params.get("sync") === "done") {
      setMessage(
        `MahaTender sync finished. Imported ${params.get("imported") ?? 0}, created ${
          params.get("created") ?? 0
        }, updated ${params.get("updated") ?? 0}.`,
      );
    }
    if (params.get("sync") === "error") {
      setMessage(params.get("message") || "MahaTender sync did not find tender records.");
    }
  }, []);

  const bookmarklet = useMemo(() => {
    if (!origin) return "";
    const endpoint = `${origin}/api/mahatender/import`;
    return `javascript:(()=>{try{var d=document,b=d.body,t=d.createElement("textarea"),u=d.createElement("input"),f=d.createElement("form");f.method="POST";f.action=${JSON.stringify(endpoint)};f.target="_blank";t.name="text";t.value=b?b.innerText:"";u.name="pageUrl";u.value=location.href;f.style.display="none";f.appendChild(t);f.appendChild(u);d.body.appendChild(f);f.submit();setTimeout(()=>f.remove(),3000);}catch(e){alert("Tender Pro Sync could not start. Open MahaTender tender page and try again.");}})();`;
  }, [origin]);

  async function copyBookmarklet() {
    await navigator.clipboard.writeText(bookmarklet);
    setMessage("Connector code copied. Create a browser bookmark and paste this code into its URL field.");
  }

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
    setMessage(
      `Synced ${data.imported} tender(s). Created ${data.created ?? 0}, updated ${data.updated ?? 0}.`,
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-3 py-5 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-black uppercase tracking-wider text-blue-700">
          MahaTender Browser Sync
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          You login and fill CAPTCHA, Tender Pro syncs the tender data
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Tender Pro cannot read another logged-in website tab directly, so this page gives you a
          small browser connector. After you login to MahaTender and fill CAPTCHA, click the
          connector bookmark. It will read the visible MahaTender page and update Submission Tracker.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">One-time setup</h2>
          <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
            <li className="rounded-md bg-slate-50 p-3">
              1. Drag the blue button below to your browser bookmarks bar.
            </li>
            <li className="rounded-md bg-slate-50 p-3">
              2. Open MahaTender and login yourself.
            </li>
            <li className="rounded-md bg-slate-50 p-3">
              3. Fill CAPTCHA/OTP manually.
            </li>
            <li className="rounded-md bg-slate-50 p-3">
              4. Open current/recent tender list or tender detail page.
            </li>
            <li className="rounded-md bg-slate-50 p-3">
              5. Click the bookmark: Tender Pro Sync.
            </li>
          </ol>
          <p className="mt-4 rounded-md border border-amber-100 bg-amber-50 p-3 text-sm font-bold text-amber-800">
            After clicking the bookmark on MahaTender, a new Tender Pro result tab should open. If no
            new tab opens, your browser blocked pop-ups or the bookmark was not installed correctly.
          </p>
          {bookmarklet && (
            <a
              href={bookmarklet}
              className="mt-5 flex justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700"
            >
              Tender Pro Sync
            </a>
          )}
          <button
            type="button"
            onClick={copyBookmarklet}
            className="mt-3 w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-50"
          >
            Copy connector code
          </button>
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
              <h2 className="text-lg font-black">Backup manual import</h2>
              <p className="text-sm text-slate-600">
                Use this only if the connector bookmark is blocked by the browser.
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
            placeholder="Optional backup: paste copied MahaTender tender list or tender details here..."
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
            {busy ? "Importing..." : "Backup Import to Submission Tracker"}
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
