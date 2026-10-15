type LoadingSkeletonProps = {
  title?: string;
  fullScreen?: boolean;
};

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-xl bg-slate-200/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.7s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent ${className}`}
    />
  );
}

export default function LoadingSkeleton({
  title = "লোড হচ্ছে...",
  fullScreen = false,
}: LoadingSkeletonProps) {
  return (
    <main
      role="status"
      aria-label={title}
      className={`relative isolate overflow-hidden ${fullScreen ? "flex min-h-screen items-center" : "min-h-[60vh]"} bg-slate-50/90 px-4 py-6 sm:px-6 lg:px-8`}
    >
      <style>{`
        @keyframes skeleton-shimmer {
          100% { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\[skeleton-shimmer_1\.7s_infinite\]::before { animation: none !important; }
        }
      `}</style>
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 -z-10 h-64 w-64 rounded-full bg-violet-200/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 -z-10 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />

      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-teal-500/20">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" strokeLinejoin="round" />
                <path d="M8 7h8M8 11h6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0 space-y-2">
              <Shimmer className="h-3 w-32 rounded-full bg-emerald-100" />
              <p className="truncate text-sm font-semibold text-slate-600">{title}</p>
            </div>
          </div>
          <Shimmer className="hidden h-10 w-28 rounded-xl bg-violet-100 sm:block" />
        </div>

        <section className="overflow-hidden rounded-3xl border border-white bg-white/90 p-5 shadow-sm shadow-slate-200/70 sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="w-full max-w-sm space-y-3">
              <Shimmer className="h-3 w-24 rounded-full bg-cyan-100" />
              <Shimmer className="h-7 w-4/5 max-w-xs rounded-lg bg-slate-200" />
              <Shimmer className="h-3 w-full max-w-sm rounded-full bg-slate-100" />
            </div>
            <Shimmer className="h-12 w-12 shrink-0 rounded-2xl bg-amber-100" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {["bg-emerald-100", "bg-sky-100", "bg-violet-100", "bg-amber-100"].map((color, index) => (
              <div key={index} className="rounded-2xl border border-slate-100 bg-white p-4">
                <Shimmer className={`mb-4 h-9 w-9 rounded-xl ${color}`} />
                <Shimmer className="mb-2 h-3 w-20 max-w-full rounded-full bg-slate-200" />
                <Shimmer className="h-6 w-24 max-w-full rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="space-y-5 rounded-3xl border border-white bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <Shimmer className="h-5 w-36 rounded-lg bg-slate-200" />
              <Shimmer className="h-9 w-24 rounded-xl bg-emerald-100" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <Shimmer className={`h-10 w-10 shrink-0 rounded-xl ${index % 2 ? "bg-violet-100" : "bg-cyan-100"}`} />
                  <div className="flex-1 space-y-2">
                    <Shimmer className="h-3 w-2/5 rounded-full bg-slate-200" />
                    <Shimmer className="h-2.5 w-3/5 rounded-full bg-slate-100" />
                  </div>
                  <Shimmer className="h-5 w-16 rounded-full bg-emerald-100" />
                </div>
              ))}
            </div>
          </section>
          <section className="space-y-5 rounded-3xl border border-white bg-white p-5 shadow-sm">
            <Shimmer className="h-5 w-32 rounded-lg bg-slate-200" />
            <div className="flex h-36 items-end justify-around gap-2 rounded-2xl bg-slate-50 p-4">
              {["h-1/2 bg-cyan-300", "h-3/4 bg-violet-300", "h-2/3 bg-emerald-300", "h-full bg-amber-300", "h-3/5 bg-sky-300", "h-4/5 bg-teal-300"].map((bar, index) => (
                <Shimmer key={index} className={`w-full rounded-t-lg rounded-b-sm ${bar}`} />
              ))}
            </div>
            <Shimmer className="h-10 w-full rounded-xl bg-violet-100" />
            <Shimmer className="h-10 w-4/5 rounded-xl bg-cyan-100" />
          </section>
        </div>
        <p className="text-center text-xs font-medium tracking-wide text-slate-400">DARUL HIKMAH · FINANCE</p>
      </div>
    </main>
  );
}
