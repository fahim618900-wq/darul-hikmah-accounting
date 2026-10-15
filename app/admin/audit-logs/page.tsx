import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuditLogsClient from "./audit-logs-client";

export default async function AuditLogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        অডিট লগ
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
        কে, কখন, কী পরিবর্তন করেছে — তার পূর্ণ ইতিহাস
      </p>

      <AuditLogsClient initialLogs={logs || []} />
    </section>
  );
}
