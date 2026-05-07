"use client";

import { useEffect, useState } from "react";

type NotificationItem = {
  id: string;
  message: string;
  createdAt: string;
};

const alertTypes = [
  { type: "Deadline approaching", severity: "Critical", due: "Today", detail: "Bid submission cut-off needs immediate action." },
  { type: "EMD validity expiry", severity: "High", due: "3 days", detail: "Bank guarantee/EMD validity should be rechecked." },
  { type: "Corrigendum added", severity: "Medium", due: "Open", detail: "Tender conditions may have changed." },
  { type: "Technical bid opening tomorrow", severity: "Medium", due: "Tomorrow", detail: "Keep login, DSC, and bid receipt ready." },
  { type: "Financial bid opening", severity: "High", due: "Scheduled", detail: "Prepare competitor and L1 comparison." },
  { type: "Eligibility changed", severity: "High", due: "Review", detail: "Qualification condition may affect bid viability." },
  { type: "Missing document", severity: "Critical", due: "Before submit", detail: "Bid readiness is blocked until document is attached." },
  { type: "Competitor participated", severity: "Low", due: "Observed", detail: "Market intelligence added to competitor profile." },
];

function severityTone(severity: string) {
  if (severity === "Critical") return "bg-rose-50 text-rose-700 border-rose-200";
  if (severity === "High") return "bg-red-50 text-red-700 border-red-200";
  if (severity === "Medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-100";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-3 py-5 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-black uppercase tracking-wider text-blue-700">Smart Alerts</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Tender Alert Center</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Deadline, EMD, corrigendum, bid opening, eligibility, missing document, and competitor alerts
          with severity for fast action.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {alertTypes.map((alert) => (
          <article key={alert.type} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-black text-slate-950">{alert.type}</h2>
              <span className={`rounded-md border px-2 py-1 text-xs font-black ${severityTone(alert.severity)}`}>
                {alert.severity}
              </span>
            </div>
            <p className="mt-2 text-sm leading-5 text-slate-600">{alert.detail}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Due: {alert.due}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">Recent Notifications</h2>
        {loading && <p className="mt-4 text-sm text-slate-500">Loading alerts...</p>}
        {!loading && notifications.length === 0 && (
          <p className="mt-4 rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No saved notifications yet.
          </p>
        )}
        <div className="mt-4 grid gap-3">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-md border border-slate-200 p-4">
              <p className="font-bold text-slate-900">{item.message}</p>
              <p className="mt-1 text-sm text-slate-500">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
