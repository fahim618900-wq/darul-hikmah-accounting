import { createClient } from "@/lib/supabase/server";
import FeesClient from "./fees-client";

export default async function FeesPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("status", "active")
    .or("is_deleted.eq.false,is_deleted.is.null")
    .is("deleted_at", null)
    .order("class_name")
    .order("roll");

  return (
    <main>
      <FeesClient students={students || []} />
    </main>
  );
}
