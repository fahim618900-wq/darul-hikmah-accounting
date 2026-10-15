import StudentView from "./view-client";

export default function StudentViewPage() {
  return (
    <main className="min-h-[calc(100dvh-68px)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100/60 via-slate-50 to-violet-100/40 px-3 py-5 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 sm:px-5 sm:py-8">
      <div className="mx-auto w-full max-w-4xl">
        <StudentView />
      </div>
    </main>
  );
}
