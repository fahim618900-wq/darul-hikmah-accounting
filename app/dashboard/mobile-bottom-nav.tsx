"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

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
  "/dashboard/income": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  "/dashboard/reports": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  ),
};

const BOTTOM_NAV: { href: string; label: string; roles: string[] }[] = [
  { href: "/dashboard", label: "হোম", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/students", label: "শিক্ষার্থী", roles: ["admin", "accountant"] },
  { href: "/dashboard/fees", label: "বেতন", roles: ["admin", "accountant"] },
  { href: "/dashboard/income", label: "আয়", roles: ["admin", "accountant"] },
  { href: "/dashboard/reports", label: "রিপোর্ট", roles: ["admin", "accountant", "viewer"] },
];

export default function MobileBottomNav({ role }: { role: string }) {
  const pathname = usePathname();

  const links = BOTTOM_NAV.filter((l) => l.roles.includes(role));

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] no-print">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl min-w-0 flex-1 transition ${
                active
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              <span className={`transition-transform ${active ? "scale-110" : ""}`}>
                {ICONS[link.href]}
              </span>
              <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>
                {link.label}
              </span>
              {active && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
