import { createClient } from "@/lib/supabase/server";
import { getFinancialData } from "@/lib/financial";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: students }, financialData] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user?.id).single(),
    supabase
      .from("students")
      .select("id, monthly_fee, discount, class_name, status")
      .eq("status", "active")
      .or("is_deleted.eq.false,is_deleted.is.null"),
    getFinancialData(supabase),
  ]);

  // Dashboard totals use the same complete, non-deleted financial data as Reports.
  return (
    <DashboardClient
      students={students || []}
      payments={financialData.feePayments || []}
      incomes={(financialData.incomes || []).map((i: any) => ({
        amount: i.amount,
        entry_date: i.entry_date,
        category_id: i.category_id,
        income_categories: i.income_categories,
      }))}
      expenses={(financialData.expenses || []).map((e: any) => ({
        amount: e.amount,
        entry_date: e.entry_date,
        category_id: e.category_id,
        expense_categories: e.expense_categories,
      }))}
      userName={profile?.full_name || user?.email || "ব্যবহারকারী"}
      currentMonth={currentMonth}
      currentYear={currentYear}
    />
  );
}
