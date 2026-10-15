import Link from "next/link";

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 shadow-sm shadow-slate-200/60 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-black/20">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6">
          <Link href="/student" className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 ring-1 ring-white/70 dark:ring-white/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" strokeLinejoin="round" />
                <path d="M8 7h8M8 11h6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-base">দারুল হিকমাহ</span>
              <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">শিক্ষার্থী পোর্টাল</span>
            </span>
          </Link>
          <nav aria-label="শিক্ষার্থী নেভিগেশন" className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link href="/student" className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 px-2.5 py-2 text-xs font-bold text-teal-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-teal-900 dark:from-teal-950/70 dark:to-emerald-950/40 dark:text-teal-200 sm:px-3 sm:text-sm">পোর্টাল</Link>
            <Link href="/student/view" className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-900 dark:hover:bg-violet-950/40 sm:px-3 sm:text-sm">তথ্য দেখুন</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
