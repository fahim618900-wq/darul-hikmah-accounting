
import { createClient } from "@/lib/supabase/server";
import FeesStatusClient from "./fees-status-client";

export default async function FeesStatusPage() {
  const supabase = await createClient();

  const { data: students, error } = await supabase
    .from("students")
    .select(
      "id, student_id, name, class_name, roll, section, monthly_fee, discount, status"
    )
    .eq("status", "active")
    .order("class_name")
    .order("roll");

  if (error) {
    return (
      <main className="container" style={{ padding: "2rem 1rem" }}>
        <h2>Paid / Unpaid তালিকা</h2>
        <p role="alert" style={{ color: "#b91c1c" }}>
          শিক্ষার্থীদের তথ্য লোড করা যায়নি। পেজটি আবার খুলুন।
        </p>
      </main>
    );
  }

  return (
    <main
      className="container"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}
    >
      <h2
        style={{
          fontSize: "1.45rem",
          color: "#0f766e",
          marginBottom: "0.35rem",
        }}
      >
        Paid / Unpaid রিপোর্ট
      </h2>

      <p
        style={{
          color: "#64748b",
          fontSize: "0.88rem",
          marginBottom: "1.25rem",
        }}
      >
        মাস ও বছর অনুযায়ী শিক্ষার্থীদের ফি এবং বকেয়ার তালিকা দেখুন।
      </p>

      <FeesStatusClient students={students || []} />
    </main>
  );
}
