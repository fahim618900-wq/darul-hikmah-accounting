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
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "0.25rem" }}>
        সিস্টেম সেটিংস
      </h2>
      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        সাইনআপ নিয়ন্ত্রণ, কর্মচারী ব্যবস্থাপনা ও অন্যান্য সেটিংস
      </p>

      <SettingsClient settings={settings || []} />

      <div style={{ marginTop: "2.5rem" }}>
        <StaffManagement staff={staff || []} currentUserId={user.id} />
      </div>
    </main>
  );
}
