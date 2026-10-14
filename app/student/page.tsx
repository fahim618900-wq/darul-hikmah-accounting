import StudentSelect from "./select-client";

export default function StudentPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-purple-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <StudentSelect />
      </div>
    </main>
  );
}
