import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintClient from "./print-client";

export default async function StudentsPrintPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("status", "active")
    .order("class_name")
    .order("roll");

  const { data: templates } = await supabase
    .from("print_templates")
    .select("*")
    .order("created_at", { ascending: false });

  return <PrintClient students={students || []} templates={templates || []} />;
}
