"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* প্রথমবার লোড: localStorage → system preference → light */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

    const shouldBeDark = saved === "dark" || (!saved && prefersDark);

    setDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
    if (!saved) {
      localStorage.setItem("theme", shouldBeDark ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "লাইট মোডে যান" : "ডার্ক মোডে যান"}
      title={dark ? "লাইট মোড" : "ডার্ক মোড"}
      className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
    >
      {/* Hydration mismatch এড়াতে — mounted না হলে ফাঁকা জায়গা */}
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          mounted ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
        }`}
      >
        {dark ? (
          /* চাঁদ (dark mode-এ সূর্য দেখাব? — আমরা convention: dark-এ চাঁদ) */
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
            <path d="M21 12.79 A 9 9 0 1 1 11.21 3 A 7 7 0 0 0 21 12.79 z" />
          </svg>
        ) : (
          /* সূর্য */
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
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </span>
    </button>
  );
}
