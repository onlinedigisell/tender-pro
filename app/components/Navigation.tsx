"use client";

import { usePathname } from "next/navigation";

export const navItems = [
  { href: "/", label: "Tender Intelligence", detail: "Command center" },
  { href: "/tenders", label: "Submission Tracker", detail: "Bid workflow" },
  { href: "/rfp", label: "RFP Analyzer", detail: "AI review" },
  { href: "/boq", label: "BOQ Intelligence", detail: "Rates and risk" },
  { href: "/bidders", label: "Competitor Insights", detail: "Market view" },
  { href: "/reports", label: "Executive Reports", detail: "Performance" },
  { href: "/sources", label: "Tender Discovery", detail: "Live sources" },
  { href: "/mahatender", label: "MahaTender Import", detail: "Assisted" },
  { href: "/activities", label: "Bid Readiness", detail: "Daily work" },
  { href: "/notifications", label: "Smart Alerts", detail: "Reminders" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 grid gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            className={`group flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold transition ${
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-blue-50 hover:text-blue-800"
            }`}
          >
            <span>{item.label}</span>
            <span className={`text-xs font-medium ${active ? "text-blue-100" : "text-slate-400"}`}>
              {item.detail}
            </span>
          </a>
        );
      })}
    </nav>
  );
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex max-w-full gap-2 overflow-x-auto px-3 py-3 text-sm sm:px-4 lg:px-6">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-md border px-3 py-2 font-semibold shadow-sm ${
              active
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-blue-100 bg-white text-blue-700 hover:border-blue-400"
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
