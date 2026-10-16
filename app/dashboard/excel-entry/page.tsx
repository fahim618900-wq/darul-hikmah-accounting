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

  const { data: incomeColumns } = await supabase
    .from("excel_column_templates")
    .select("*")
    .eq("page_type", "income")
    .order("column_order");

  const { data: expenseColumns } = await supabase
    .from("excel_column_templates")
    .select("*")
    .eq("page_type", "expense")
    .order("column_order");

  return (
    <ExcelEntryClient
      incomeColumns={incomeColumns || []}
      expenseColumns={expenseColumns || []}
      userName={profile.full_name || user.email || ""}
    />
  );
}
