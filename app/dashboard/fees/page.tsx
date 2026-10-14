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
    <main>
      <FeesClient students={students || []} />
    </main>
  );
}
