import { createClient } from "@/lib/supabase/server";
import FeesClient from "./fees-client";

export default async function FeesPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("status", "active")
    .order("class_name")
    .order("roll");

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "0.25rem" }}>
        বেতন আদায়
      </h2>
      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        শিক্ষার্থী নির্বাচন করে মাসভিত্তিক বেতন আদায় করুন
      </p>

      <FeesClient students={students || []} />
    </main>
  );
}
