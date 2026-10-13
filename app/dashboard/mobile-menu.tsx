"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
};

export default function MobileMenu({
  navLinks,
  fullName,
  role,
}: {
  navLinks: NavLinkItem[];
  fullName: string;
  role?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /* Body scroll lock while drawer open */
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  /* Esc key to close */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const roleLabel: Record<string, string> = {
    admin: "অ্যাডমিন",
    accountant: "অ্যাকাউন্ট্যান্ট",
    viewer: "দর্শক",
    pending: "অপেক্ষমাণ",
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="মেনু খুলুন"
        aria-expanded={open}
        className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 transition"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="মোবাইল নেভিগেশন মেনু"
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ---------- Drawer Header ---------- */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-teal-700 dark:bg-teal-500" />
            <span className="text-base font-bold text-slate-900 dark:text-white">
              মেনু
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="মেনু বন্ধ করুন"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18 6 L 6 18 M 6 6 l 12 12" />
            </svg>
          </button>
        </div>

        {/* ---------- User Card ---------- */}
        <div className="px-5 pt-4 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 border border-teal-100 dark:border-teal-900/50">
            <div className="w-10 h-10 rounded-full bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-teal-700/70 dark:text-teal-400/70 leading-tight">
                আসসালামু আলাইকুম
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {fullName}
              </div>
              {role && (
                <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-0.5">
                  {roleLabel[role] || role}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------- Nav Links (scrollable) ---------- */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 mt-1">
          <ul className="space-y-0.5">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      active
                        ? "bg-teal-700 text-white shadow-sm shadow-teal-700/30"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {link.icon ? (
                      <span
                        className={`w-5 h-5 flex items-center justify-center shrink-0 [&>svg]:w-[18px] [&>svg]:h-[18px] ${
                          active
                            ? "text-white"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {link.icon}
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 ml-2" />
                    )}
                    <span className="truncate">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ---------- Drawer Footer ---------- */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            দারুল হিকমাহ মডেল মাদ্রাসা
          </p>
        </div>
      </aside>
    </>
  );
}
