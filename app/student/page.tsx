import StudentSelect from "./select-client";

export default function StudentPage() {
  return (
    <main className="relative isolate min-h-[calc(100dvh-68px)] overflow-hidden px-3 py-5 sm:px-5 sm:py-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100/70 via-slate-50 to-violet-100/50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
      <div className="relative mx-auto w-full max-w-2xl">
        <StudentSelect />
      </div>
    </main>
  );
}
