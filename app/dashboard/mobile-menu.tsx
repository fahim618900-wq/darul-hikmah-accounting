"use client";

import { useState } from "react";
import Link from "next/link";

type NavLink = { href: string; label: string };

export default function MobileMenu({
  navLinks,
  fullName,
}: {
  navLinks: NavLink[];
  fullName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="মেনু খুলুন"
        className="lg:hidden w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col justify-between transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="text-base font-bold text-slate-900 dark:text-white">
              মেনু
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="মেনু বন্ধ করুন"
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-6 border border-slate-100 dark:border-slate-700">
            <div className="text-xs text-slate-400">আসসালামু আলাইকুম</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {fullName}
            </div>
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
