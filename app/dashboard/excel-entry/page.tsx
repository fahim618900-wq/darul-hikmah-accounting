import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExcelEntryClient from "./excel-entry-client";

export default async function ExcelEntryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "accountant"].includes(profile.role)) {
    redirect("/dashboard");
  }

  // আয়ের খাত
  const { data: incomeCategories } = await supabase
    .from("income_categories")
    .select("id, name")
    .order("name");

  // ডাইনামিক কলাম
  const { data: columns } = await supabase
    .from("excel_column_templates")
    .select("*")
    .eq("page_type", "income")
    .eq("is_active", true)
    .order("column_order");

  return (
    <ExcelEntryClient
      incomeCategories={incomeCategories || []}
      initialColumns={columns || []}
      userName={profile.full_name || user.email || ""}
    />
  );
}
