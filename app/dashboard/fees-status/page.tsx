import { createClient } from "@/lib/supabase/server";
import FeesStatusClient from "./fees-status-client";

export default async function FeesStatusPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
  .from("students")
  .select("id, student_id, name, class_name, roll, section, monthly_fee, discount, status")
  .eq("status", "active")
  .order("class_name")
  .order("roll");

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "0.25rem" }}>
        Paid / Unpaid তালিকা
      </h2>
      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        মাস ও বছর নির্বাচন করে বেতন পরিশোধের অবস্থা দেখুন
      </p>

      <FeesStatusClient students={students || []} />
    </main>
  );
}
