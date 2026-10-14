"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  "/dashboard": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  "/dashboard/students": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  "/dashboard/fees": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  "/dashboard/fees-status": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  "/dashboard/income": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  "/dashboard/expenses": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  ),
  "/dashboard/reports": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  "/admin/users": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  "/admin/audit-logs": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  "/admin/closed-months": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  "/admin/settings": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  "/admin/clear-data": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  ),
  "/more": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
};

/* ==================== নেভিগেশন লিংক ==================== */

const ALL_LINKS: { href: string; label: string; roles: string[] }[] = [
  { href: "/dashboard", label: "হোম", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/students", label: "শিক্ষার্থী", roles: ["admin", "accountant"] },
  { href: "/dashboard/fees", label: "বেতন", roles: ["admin", "accountant"] },
  { href: "/dashboard/income", label: "আয়", roles: ["admin", "accountant"] },
  { href: "/dashboard/reports", label: "রিপোর্ট", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/fees-status", label: "Paid/Unpaid", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/expenses", label: "ব্যয়", roles: ["admin", "accountant"] },
  { href: "/admin/users", label: "ব্যবহারকারী", roles: ["admin"] },
  { href: "/admin/audit-logs", label: "অডিট লগ", roles: ["admin"] },
  { href: "/admin/closed-months", label: "মাস বন্ধ", roles: ["admin"] },
  { href: "/admin/settings", label: "সেটিংস", roles: ["admin"] },
  { href: "/admin/clear-data", label: "ডেটা মুছুন", roles: ["admin"] },
];

/* ==================== Active Check ==================== */
/**
 * একটি লিংক active কি না তা নির্ধারণ করে
 *
 * সমস্যা: /dashboard/fees-status থাকলে /dashboard/fees-ও active দেখাত
 * কারণ "/dashboard/fees-status".startsWith("/dashboard/fees") === true
 *
 * সমাধান: প্রতিটি লিংকের জন্য সুনির্দিষ্ট নিয়ম
 */
function isLinkActive(pathname: string, href: string): boolean {
  // হোম: হুবহু মিলতে হবে
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  // বেতন: /dashboard/fees হুবহু অথবা /dashboard/fees/pay/... কিন্তু fees-status নয়
  if (href === "/dashboard/fees") {
    if (pathname === "/dashboard/fees") return true;
    if (pathname.startsWith("/dashboard/fees/pay/")) return true;
    if (pathname.startsWith("/dashboard/fees/receipt")) return true;
    return false;
  }

  // Paid/Unpaid: /dashboard/fees-status শুধু
  if (href === "/dashboard/fees-status") {
    return pathname.startsWith("/dashboard/fees-status");
  }

  // শিক্ষার্থী: /dashboard/students কিন্তু students/print ও students/[id] সহ
  if (href === "/dashboard/students") {
    return (
      pathname === "/dashboard/students" ||
      pathname.startsWith("/dashboard/students/")
    );
  }

  // আয়: /dashboard/income
  if (href === "/dashboard/income") {
    return (
      pathname === "/dashboard/income" ||
      pathname.startsWith("/dashboard/income/")
    );
  }

  // ব্যয়: /dashboard/expenses
  if (href === "/dashboard/expenses") {
    return (
      pathname === "/dashboard/expenses" ||
      pathname.startsWith("/dashboard/expenses/")
    );
  }

  // রিপোর্ট: /dashboard/reports
  if (href === "/dashboard/reports") {
    return (
      pathname === "/dashboard/reports" ||
      pathname.startsWith("/dashboard/reports/")
    );
  }

  // বাকি সব লিংক: সাধারণ startsWith
  return pathname === href || pathname.startsWith(href + "/");
}

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

  const primaryCount = role === "admin" ? 4 : 5;
  const primaryLinks = visibleLinks.slice(0, primaryCount);
  const moreLinks = visibleLinks.slice(primaryCount);

  function handleLinkClick() {
    setMoreOpen(false);
  }

  return (
    <>
      {/* "আরও" ড্রয়ার */}
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
                const active = isLinkActive(pathname, link.href);
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
            const active = isLinkActive(pathname, link.href);
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
