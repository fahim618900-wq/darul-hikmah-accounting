import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./settings-client";
import StaffManagement from "./staff-management";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: settings } = await supabase
    .from("app_settings")
    .select("*");

  const { data: staff } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_held, held_at, held_reason, created_at")
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        সিস্টেম সেটিংস
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
        সাইনআপ নিয়ন্ত্রণ, কর্মচারী ব্যবস্থাপনা ও অন্যান্য সেটিংস
      </p>

      <SettingsClient settings={settings || []} />

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-6">
        <StaffManagement staff={staff || []} currentUserId={user.id} />
      </div>
    </section>
  );
}
