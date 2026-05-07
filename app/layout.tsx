import type { Metadata } from "next";
import "./globals.css";
import LogoMark from "./components/LogoMark";
import NotificationSetup from "./components/NotificationSetup";

export const metadata: Metadata = {
  title: "Tender Pro",
  description: "Tender and Activity Management System",
  icons: {
    icon: "/app-icon.svg",
    apple: "/app-icon.svg",
  },
};

const navItems = [
  { href: "/", label: "Dashboard", detail: "Overview" },
  { href: "/tenders", label: "Tenders", detail: "Records" },
  { href: "/bidders", label: "Bidders", detail: "Competitors" },
  { href: "/rfp", label: "RFP Analyzer", detail: "PDF" },
  { href: "/reports", label: "Reports", detail: "Totals" },
  { href: "/sources", label: "Live Sources", detail: "Fetch" },
  { href: "/activities", label: "Activities", detail: "Daily work" },
  { href: "/notifications", label: "Alerts", detail: "Reminders" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f3f6fb] text-slate-950 antialiased">
        <div className="min-h-screen lg:flex">
          <aside className="hidden w-72 border-r border-slate-200 bg-white px-4 py-5 shadow-sm lg:block">
            <div className="rounded-xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 p-4">
              <LogoMark />
            </div>

            <nav className="mt-6 grid gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-600 hover:text-white"
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                    {item.detail}
                  </span>
                </a>
              ))}
            </nav>

            <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-bold text-blue-950">Tender control room</p>
              <p className="mt-2 text-sm leading-5 text-blue-900">
                Track live sources, bid decisions, quoted rates, work completion, and certificates.
              </p>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <header className="sticky top-0 z-40 border-b border-blue-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 px-3 py-3 text-white sm:px-4 lg:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="lg:hidden">
                  <LogoMark compact />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-cyan-50">Business dashboard</p>
                  <p className="text-lg font-bold tracking-tight">Tender Pro Workspace</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <a
                    href="/tenders"
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 sm:px-4"
                  >
                    Add Tender
                  </a>
                  <a
                    href="/reports"
                    className="hidden rounded-md border border-white/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 sm:inline-flex"
                  >
                    Reports
                  </a>
                </div>
                </div>
              </div>

              <nav className="flex max-w-full gap-2 overflow-x-auto px-3 py-3 text-sm sm:px-4 lg:px-6">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="whitespace-nowrap rounded-md border border-blue-100 bg-white px-3 py-2 font-semibold text-blue-700 shadow-sm hover:border-blue-400"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </header>

            {children}
            <NotificationSetup />
          </div>
        </div>
      </body>
    </html>
  );
}
