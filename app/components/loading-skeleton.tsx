type LoadingSkeletonProps = {
  title?: string;
  fullScreen?: boolean;
  layout?: "dashboard" | "table" | "form" | "report" | "profile" | "admin" | "receipt";
};

function Bar({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`relative overflow-hidden rounded-full bg-slate-200/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.1s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/90 before:to-transparent dark:bg-slate-800 dark:before:via-slate-600/60 ${className}`} />;
}

function SkeletonCard({ color = "teal" }: { color?: "teal" | "blue" | "violet" | "amber" }) {
  const colors = { teal: "bg-teal-100 dark:bg-teal-950/60", blue: "bg-sky-100 dark:bg-sky-950/60", violet: "bg-violet-100 dark:bg-violet-950/60", amber: "bg-amber-100 dark:bg-amber-950/60" };
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><Bar className={`mb-4 h-9 w-9 rounded-xl ${colors[color]}`} /><Bar className="mb-2 h-3 w-2/3" /><Bar className="h-6 w-1/2 rounded-lg" /></div>;
}

function TableSkeleton() {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-teal-50 to-cyan-50 p-4 dark:from-slate-800 dark:to-slate-800"><Bar className="h-4 w-32 bg-teal-100 dark:bg-teal-950" /><Bar className="h-9 w-24 rounded-xl bg-cyan-100 dark:bg-cyan-950" /></div>
    <div className="space-y-0 px-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="flex items-center gap-3 border-t border-slate-100 py-4 dark:border-slate-800"><Bar className={`h-9 w-9 shrink-0 rounded-xl ${i % 2 ? "bg-violet-100 dark:bg-violet-950" : "bg-teal-100 dark:bg-teal-950"}`} /><div className="min-w-0 flex-1 space-y-2"><Bar className="h-3 w-2/5" /><Bar className="h-2.5 w-3/5 opacity-60" /></div><Bar className="h-7 w-16 rounded-lg bg-emerald-100 dark:bg-emerald-950" /></div>)}</div>
  </section>;
}

export default function LoadingSkeleton({ title = "লোড হচ্ছে...", fullScreen = false, layout = "dashboard" }: LoadingSkeletonProps) {
  const shell = fullScreen ? "min-h-[100dvh]" : "min-h-[55vh]";
  return <main role="status" aria-label={title} className={`relative isolate overflow-hidden ${shell} bg-gradient-to-br from-slate-50 via-teal-50/30 to-violet-50/30 px-3 py-5 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-5 sm:py-7`}>
    <style>{`@keyframes skeleton-shimmer { 100% { transform: translateX(100%); } } @media (prefers-reduced-motion: reduce) { .animate-\\[skeleton-shimmer_1\\.1s_ease-in-out_infinite\\]::before { animation: none !important; } }`}</style>
    <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 -z-10 h-64 w-64 rounded-full bg-cyan-200/30 blur-3xl" />
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 -z-10 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <header className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-lg font-black text-white shadow-lg shadow-teal-500/20">د</div><div className="min-w-0 flex-1"><Bar className="mb-2 h-3 w-32 bg-teal-100 dark:bg-teal-950" /><p className="truncate text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</p></div><Bar className="hidden h-9 w-24 rounded-xl bg-violet-100 dark:bg-violet-950 sm:block" /></header>

      {#if layout === "dashboard"}
        <section className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div className="w-full max-w-sm space-y-3"><Bar className="h-3 w-24 bg-cyan-100 dark:bg-cyan-950" /><Bar className="h-7 w-4/5 rounded-lg" /><Bar className="h-3 w-full opacity-60" /></div><Bar className="h-12 w-12 shrink-0 rounded-2xl bg-amber-100 dark:bg-amber-950" /></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{#each ["teal","blue","violet","amber"] as color}<SkeletonCard color={color} />{/each}</div></section>
        <div className="grid gap-5 lg:grid-cols-3"><section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2"><Bar className="h-5 w-36" />{#each [1,2,3,4] as n}<div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"><Bar className="h-10 w-10 shrink-0 rounded-xl bg-cyan-100 dark:bg-cyan-950" /><div className="flex-1 space-y-2"><Bar className="h-3 w-2/5" /><Bar className="h-2.5 w-3/5 opacity-60" /></div><Bar className="h-5 w-16 bg-emerald-100 dark:bg-emerald-950" /></div>{/each}</section><section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><Bar className="h-5 w-32" /><div className="flex h-36 items-end justify-around gap-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">{#each ["h-1/2 bg-cyan-300","h-3/4 bg-violet-300","h-2/3 bg-emerald-300","h-full bg-amber-300","h-3/5 bg-sky-300"] as bar}<Bar className={`w-full rounded-t-lg rounded-b-sm ${bar}`} />{/each}</div><Bar className="h-9 w-full bg-violet-100 dark:bg-violet-950" /></section></div>
      {:else if layout === "table"}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{#each ["teal","blue","violet","amber"] as color}<SkeletonCard color={color} />{/each}</div><div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"><Bar className="h-10 flex-1 rounded-xl" /><Bar className="h-10 w-24 rounded-xl bg-teal-100 dark:bg-teal-950" /></div><TableSkeleton />
      {:else if layout === "form"}
        <section className="mx-auto max-w-3xl space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7"><Bar className="h-7 w-52 rounded-lg" /><Bar className="h-3 w-4/5 opacity-60" /><div className="grid gap-4 sm:grid-cols-2">{#each [1,2,3,4,5,6] as n}<div className="space-y-2"><Bar className="h-3 w-24 bg-teal-100 dark:bg-teal-950" /><Bar className="h-11 w-full rounded-xl" /></div>{/each}</div><Bar className="h-11 w-full rounded-xl bg-emerald-100 dark:bg-emerald-950 sm:w-40" /></section>
      {:else if layout === "report"}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{#each ["teal","blue","violet","amber"] as color}<SkeletonCard color={color} />{/each}</div><section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="flex justify-between"><Bar className="h-5 w-40" /><Bar className="h-9 w-24 rounded-xl" /></div><Bar className="h-48 w-full rounded-2xl bg-cyan-100 dark:bg-cyan-950" /><TableSkeleton /></section>
      {:else if layout === "profile"}
        <section className="mx-auto max-w-3xl space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-teal-50 to-violet-50 p-4 dark:from-slate-800 dark:to-slate-800"><Bar className="h-16 w-16 shrink-0 rounded-2xl bg-teal-100 dark:bg-teal-950" /><div className="flex-1 space-y-2"><Bar className="h-5 w-44" /><Bar className="h-3 w-28" /></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{#each ["teal","blue","violet","amber","teal","blue"] as color}<SkeletonCard color={color} />{/each}</div><TableSkeleton /></section>
      {:else if layout === "receipt"}
        <section className="mx-auto max-w-3xl space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"><div className="text-center"><Bar className="mx-auto mb-3 h-7 w-48 rounded-lg bg-teal-100 dark:bg-teal-950" /><Bar className="mx-auto h-3 w-36" /></div><div className="space-y-4 border-y border-dashed border-slate-300 py-5 dark:border-slate-700">{#each [1,2,3,4,5] as n}<div className="flex justify-between gap-4"><Bar className="h-3 w-28" /><Bar className="h-3 w-24 bg-emerald-100 dark:bg-emerald-950" /></div>{/each}</div><Bar className="h-11 w-36 rounded-xl bg-teal-100 dark:bg-teal-950" /></section>
      {:else}
        <div className="grid gap-5 lg:grid-cols-2"><section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">{#each [1,2,3,4,5] as n}<div className="flex items-center gap-3"><Bar className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-950" /><div className="flex-1 space-y-2"><Bar className="h-3 w-2/5" /><Bar className="h-2.5 w-3/5 opacity-60" /></div></div>{/each}</section><section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">{#each [1,2,3,4,5] as n}<div className="flex items-center gap-3"><Bar className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950" /><div className="flex-1 space-y-2"><Bar className="h-3 w-2/5" /><Bar className="h-2.5 w-3/5 opacity-60" /></div></div>{/each}</section></div>
      {/if}
      <p className="pt-1 text-center text-[10px] font-semibold tracking-[0.18em] text-slate-400">DARUL HIKMAH · FINANCE</p>
    </div>
  </main>;
}
