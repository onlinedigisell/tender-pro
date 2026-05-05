import type { Metadata } from "next";
import "./globals.css";
import NotificationSetup from "./components/NotificationSetup";

export const metadata: Metadata = {
  title: "Tender Pro",
  description: "Tender and Activity Management System",
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/tenders", label: "Tenders" },
  { href: "/activities", label: "Activities" },
  { href: "/sources", label: "Live Sources" },
  { href: "/notifications", label: "Alerts" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-950">
        <div className="min-h-screen lg:flex">
          <aside className="hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Civil consultancy
              </p>
              <h1 className="mt-1 text-2xl font-bold">Tender Pro</h1>
            </div>

            <nav className="grid gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold">Live tender monitor</p>
              <p className="mt-1 text-sm text-slate-600">
                Add trusted portal URLs, fetch new tenders, and review alerts from one place.
              </p>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <header className="border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
              <h1 className="font-bold">Tender Pro</h1>
              <nav className="mt-3 flex gap-4 overflow-x-auto text-sm">
                {navItems.map((item) => (
                  <a key={item.href} href={item.href} className="whitespace-nowrap text-slate-700">
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
