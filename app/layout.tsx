import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tender Pro",
  description: "Tender and Activity Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <div className="min-h-screen flex">
          
          {/* Sidebar */}
          <aside className="w-64 bg-black text-white p-5 hidden md:block">
            <h1 className="text-2xl font-bold mb-8">Tender Pro</h1>

            <nav className="grid gap-3">
              <a href="/" className="hover:bg-gray-800 p-3 rounded">
                Dashboard
              </a>
              <a href="/tenders" className="hover:bg-gray-800 p-3 rounded">
                Tenders
              </a>
              <a href="/activities" className="hover:bg-gray-800 p-3 rounded">
                Activities
              </a>
              <a href="/sources" className="hover:bg-gray-800 p-3 rounded">
                Tender Sources
              </a>
              <a href="/notifications" className="hover:bg-gray-800 p-3 rounded">
                Notifications
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <section className="flex-1">
            
            {/* Mobile Header */}
            <header className="bg-white border-b p-4 md:hidden">
              <h1 className="font-bold">Tender Pro</h1>
              <div className="flex gap-3 mt-3 text-sm overflow-x-auto">
                <a href="/">Dashboard</a>
                <a href="/tenders">Tenders</a>
                <a href="/activities">Activities</a>
                <a href="/sources">Sources</a>
                <a href="/notifications">Alerts</a>
              </div>
            </header>

            {/* Page Content */}
            {children}
          </section>

        </div>
      </body>
    </html>
  );
}
