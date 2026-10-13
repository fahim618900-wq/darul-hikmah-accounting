"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

/* ==================== আইকন ==================== */

const Icon = ({ path }: { path: string }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);

const ICONS: Record<string, React.ReactNode> = {
  "/dashboard": <Icon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22 L9 12 L15 12 L15 22" />,
  "/dashboard/students": <Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7 a4 4 0 1 0 0 8 a4 4 0 0 0 0-8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />,
  "/dashboard/fees": <Icon path="M2 5 h20 v14 h-20 z M2 10 L22 10" />,
  "/dashboard/fees-status": <Icon path="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  "/dashboard/income": <Icon path="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  "/dashboard/expenses": <Icon path="M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3" />,
  "/dashboard/reports": <Icon path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />,
  "/admin/users": <Icon path="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0 8a4 4 0 0 0 0-8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />,
  "/admin/audit-logs": <Icon path="M12 8v4l3 3 M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />,
  "/admin/closed-months": <Icon path="M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />,
  "/admin/settings": <Icon path="M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6 M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33a1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />,
  "/admin/clear-data": <Icon path="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6" />,
  "/more": <Icon path="M4 6h16 M4 12h16 M4 18h16" />,
};

/* ==================== নেভিগেশন লিংক ==================== */

const ALL_LINKS: { href: string; label: string; roles: string[] }[] = [
  { href: "/dashboard", label: "হোম", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/students", label: "শিক্ষার্থী", roles: ["admin", "accountant"] },
  { href: "/dashboard/fees", label: "বেতন", roles: ["admin", "accountant"] },
  { href: "/dashboard/fees-status", label: "Paid/Unpaid", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/income", label: "আয়", roles: ["admin", "accountant"] },
  { href: "/dashboard/expenses", label: "ব্যয়", roles: ["admin", "accountant"] },
  { href: "/dashboard/reports", label: "রিপোর্ট", roles: ["admin", "accountant", "viewer"] },
  { href: "/admin/users", label: "ব্যবহারকারী", roles: ["admin"] },
  { href: "/admin/audit-logs", label: "অডিট লগ", roles: ["admin"] },
  { href: "/admin/closed-months", label: "মাস বন্ধ", roles: ["admin"] },
  { href: "/admin/settings", label: "সেটিংস", roles: ["admin"] },
  { href: "/admin/clear-data", label: "ডেটা মুছুন", roles: ["admin"] },
];

/* ==================== মূল কম্পোনেন্ট ==================== */

export default function MobileBottomNav({
  role,
  fullName,
}: {
  role: string;
  fullName: string;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const visibleLinks = ALL_LINKS.filter((l) => l.roles.includes(role));

  // মোবাইলে ৪টি মেইন লিংক + "আরও" বাটন (admin হলে)
  const primaryCount = role === "admin" ? 4 : 5;
  const primaryLinks = visibleLinks.slice(0, primaryCount);
  const moreLinks = visibleLinks.slice(primaryCount);

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  function handleLinkClick() {
    setMoreOpen(false);
  }

  return (
    <>
      {/* "আরও" ড্রয়ার (নিচ থেকে উপরে) */}
      {moreOpen && (
        <>
          <div
            onClick={() => setMoreOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          />
          <div className="lg:hidden fixed bottom-20 left-3 right-3 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-400 dark:text-slate-500">
                আসসালামু আলাইকুম
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {fullName}
              </div>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {moreLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
                      active
                        ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center">
                      {ICONS[link.href] || ICONS["/more"]}
                    </span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* নিচের বার */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] no-print">
        <div className="flex items-center justify-around px-1 py-1.5">
          {primaryLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl min-w-0 flex-1 transition ${
                  active
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {active && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
                )}
                <span className={`transition-transform ${active ? "scale-110" : ""}`}>
                  {ICONS[link.href]}
                </span>
                <span className={`text-[10px] font-medium truncate max-w-full ${active ? "font-semibold" : ""}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}

          {moreLinks.length > 0 && (
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl min-w-0 flex-1 transition ${
                moreOpen
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {moreOpen && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
              )}
              <span className={`transition-transform ${moreOpen ? "scale-110" : ""}`}>
                {ICONS["/more"]}
              </span>
              <span className={`text-[10px] font-medium ${moreOpen ? "font-semibold" : ""}`}>
                আরও
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
