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

  // ব্যয়ের খাত
  const { data: expenseCategories } = await supabase
    .from("expense_categories")
    .select("id, name")
    .order("name");

  // আয়ের কলাম টেমপ্লেট
  const { data: incomeColumns } = await supabase
    .from("excel_column_templates")
    .select("*")
    .eq("page_type", "income")
    .order("column_order");

  // ব্যয়ের কলাম টেমপ্লেট
  const { data: expenseColumns } = await supabase
    .from("excel_column_templates")
    .select("*")
    .eq("page_type", "expense")
    .order("column_order");

  return (
    <ExcelEntryClient
      incomeCategories={incomeCategories || []}
      expenseCategories={expenseCategories || []}
      incomeColumns={incomeColumns || []}
      expenseColumns={expenseColumns || []}
      userName={profile.full_name || user.email || ""}
    />
  );
}
