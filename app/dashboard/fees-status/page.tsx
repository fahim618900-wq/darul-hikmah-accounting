import { createClient } from "@/lib/supabase/server";
import FeesStatusClient from "./fees-status-client";

export default async function FeesStatusPage({ searchParams }: { searchParams: { highlight?: string; month?: string; year?: string; date?: string } }) {
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
    .select("id, student_id, name, class_name, roll, section, guardian_name, guardian_phone, monthly_fee, discount, status")
    .eq("status", "active")
    .order("class_name")
    .order("roll");

  return (
    <main>
      <FeesStatusClient
        students={students || []}
        userName={profile?.full_name || user?.email || ""}
        highlight={searchParams.highlight || ""}
        initialMonth={searchParams.month ? Number(searchParams.month) : undefined}
        initialYear={searchParams.year ? Number(searchParams.year) : undefined}
        highlightDate={searchParams.date || ""}
      />
    </main>
  );
}
