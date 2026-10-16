"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ==================== আইকন ==================== */

const ICONS: Record<string, React.ReactNode> = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
      <path d="M9 22V12h6v10" />
    </svg>
  ),
  students: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  wallet: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  ),
  check: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  chart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <rect x="7" y="10" width="3" height="8" rx="1" />
      <rect x="12" y="6" width="3" height="12" rx="1" />
      <rect x="17" y="13" width="3" height="5" rx="1" />
    </svg>
  ),
  more: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  ),
  excel: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  ),
  event: (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M9 14l2 2 4-4" />
  </svg>
),
  income: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M15 9.5H10.5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4H9" />
    </svg>
  ),
  expense: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
      <path d="M15 7h4v4" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  history: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  lock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  trash: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

/* ==================== নেভিগেশন লিংক ==================== */

const PRIMARY_LINKS: { href: string; label: string; icon: string; roles: string[] }[] = [
  { href: "/dashboard", label: "হোম", icon: "home", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/students", label: "শিক্ষার্থী", icon: "students", roles: ["admin", "accountant"] },
  { href: "/dashboard/fees", label: "বেতন", icon: "wallet", roles: ["admin", "accountant"] },
  { href: "/dashboard/fees-status", label: "Paid/Unpaid", icon: "check", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/reports", label: "রিপোর্ট", icon: "chart", roles: ["admin", "accountant", "viewer"] },
];

const MORE_LINKS: { href: string; label: string; icon: string; roles: string[] }[] = [
  { href: "/dashboard/excel-entry", label: "এক্সেল এন্ট্রি", icon: "excel", roles: ["admin", "accountant"] },
  { href: "/dashboard/income", label: "আয়", icon: "income", roles: ["admin", "accountant"] },
  { href: "/dashboard/expenses", label: "ব্যয়", icon: "expense", roles: ["admin", "accountant"] },
  { href: "/admin/users", label: "ব্যবহারকারী", icon: "users", roles: ["admin"] },
  { href: "/admin/audit-logs", label: "অডিট লগ", icon: "history", roles: ["admin"] },
  { href: "/admin/closed-months", label: "মাস বন্ধ", icon: "lock", roles: ["admin"] },
  { href: "/admin/settings", label: "সেটিংস", icon: "settings", roles: ["admin"] },
  { href: "/admin/clear-data", label: "ডেটা মুছুন", icon: "trash", roles: ["admin"] },  { href: "/dashboard/events", label: "ইভেন্ট ফি", icon: "event", roles: ["admin", "accountant", "viewer"] },
];

/* ==================== Active Check ==================== */

function isLinkActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  if (href === "/dashboard/fees") {
    if (pathname === "/dashboard/fees") return true;
    if (pathname.startsWith("/dashboard/fees/pay/")) return true;
    if (pathname.startsWith("/dashboard/fees/receipt")) return true;
    return false;
  }

  if (href === "/dashboard/fees-status") {
    return pathname.startsWith("/dashboard/fees-status");
  }

  if (href === "/dashboard/students") {
    return (
      pathname === "/dashboard/students" ||
      pathname.startsWith("/dashboard/students/")
    );
  }

  if (href === "/dashboard/excel-entry") {
  return pathname.startsWith("/dashboard/excel-entry");
}

if (href === "/dashboard/events") {
  return pathname.startsWith("/dashboard/events");
}

  if (href === "/dashboard/income") {
    if (pathname === "/dashboard/income") return true;
    if (pathname.startsWith("/dashboard/income/")) return true;
    return false;
  }

  if (href === "/dashboard/expenses") {
    return (
      pathname === "/dashboard/expenses" ||
      pathname.startsWith("/dashboard/expenses/")
    );
  }

  if (href === "/dashboard/reports") {
    return (
      pathname === "/dashboard/reports" ||
      pathname.startsWith("/dashboard/reports/")
    );
  }

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
  const router = useRouter();
  const supabase = createClient();
  const [moreOpen, setMoreOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const primaryLinks = PRIMARY_LINKS.filter((l) => l.roles.includes(role));
  const moreLinks = MORE_LINKS.filter((l) => l.roles.includes(role));

  function handleLinkClick() {
    setMoreOpen(false);
  }

  async function handleLogout() {
    const confirmed = confirm("আপনি কি লগআউট করতে চান?");
    if (!confirmed) return;

    setLoggingOut(true);
    await supabase.auth.signOut();
    setMoreOpen(false);
    router.push("/login");
    router.refresh();
  }

  const hasActiveInMore = moreLinks.some((l) => isLinkActive(pathname, l.href));

  return (
    <>
      {/* "আরও" ড্রয়ার */}
      {moreOpen && (
        <>
          <div
            onClick={() => setMoreOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          />
          <div className="lg:hidden fixed bottom-[68px] left-2 right-2 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* ইউজার প্রোফাইল হেডার */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-slate-500 dark:text-slate-400">
                  আসসালামু আলাইকুম
                </div>
                <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {fullName}
                </div>
              </div>
            </div>

            {/* লিংক তালিকা */}
            <div className="p-1.5 max-h-[55vh] overflow-y-auto">
              {moreLinks.map((link) => {
                const active = isLinkActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition ${
                      active
                        ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {ICONS[link.icon]}
                    </span>
                    <span>{link.label}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* লগআউট বাটন */}
            <div className="p-1.5 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[13px] font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-60"
              >
                {loggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    লগআউট হচ্ছে...
                  </>
                ) : (
                  <>
                    {ICONS.logout}
                    লগআউট করুন
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* নিচের বার */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] no-print">
        <div className="flex items-center justify-around px-0.5 py-1">
          {primaryLinks.map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-xl min-w-0 flex-1 transition ${
                  active
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {active && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
                )}
                <span className={`transition-transform ${active ? "scale-110" : ""}`}>
                  {ICONS[link.icon]}
                </span>
                <span className={`text-[9px] leading-tight font-medium truncate max-w-full ${active ? "font-semibold" : ""}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}

          {moreLinks.length > 0 && (
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-xl min-w-0 flex-1 transition ${
                moreOpen || hasActiveInMore
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {(moreOpen || hasActiveInMore) && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
              )}
              <span className={`transition-transform ${moreOpen || hasActiveInMore ? "scale-110" : ""}`}>
                {ICONS.more}
              </span>
              <span className={`text-[9px] leading-tight font-medium ${moreOpen || hasActiveInMore ? "font-semibold" : ""}`}>
                আরও
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
