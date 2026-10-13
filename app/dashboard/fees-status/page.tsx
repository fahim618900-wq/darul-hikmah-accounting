import { createClient } from "@/lib/supabase/server";
import FeesStatusClient from "./fees-status-client";

export default async function FeesStatusPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id)
    .single();

  const { data: students } = await supabase
    .from("students")
    .select("id, student_id, name, class_name, roll, section, monthly_fee, discount, status")
    .eq("status", "active")
    .order("class_name")
    .order("roll");

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <FeesStatusClient
        students={students || []}
        userName={profile?.full_name || user?.email || ""}
      />
    </main>
  );
}
