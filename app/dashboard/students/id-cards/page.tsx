import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import IdCardsClient from "./id-cards-client";

export default async function IdCardsPage() {
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

  return <IdCardsClient students={students || []} />;
}
