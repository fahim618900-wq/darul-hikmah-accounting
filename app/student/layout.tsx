import Link from "next/link";

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/student" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-md shadow-teal-500/20">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" strokeLinejoin="round" />
                <path d="M8 7h8M8 11h6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold text-slate-900 dark:text-white">দারুল হিকমাহ</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">শিক্ষার্থী পোর্টাল</span>
            </span>
          </Link>
          <nav aria-label="শিক্ষার্থী নেভিগেশন" className="flex shrink-0 items-center gap-1.5">
            <Link href="/student" className="rounded-xl border border-teal-100 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-200 sm:text-sm">পোর্টাল</Link>
            <Link href="/student/view" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:text-sm">তথ্য দেখুন</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
