import { createClient } from "@/lib/supabase/server";
import { getFinancialData } from "@/lib/financial";
import ReportsClient from "./reports-client";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id)
    .single();

  const [studentsResult, incomeCategoriesResult, expenseCategoriesResult, financialData] = await Promise.all([
    supabase
      .from("students")
      .select("id, student_id, name, class_name, roll, section, monthly_fee, discount, status")
      .eq("status", "active")
      .order("class_name")
      .order("roll"),
    supabase.from("income_categories").select("id, name").order("name"),
    supabase.from("expense_categories").select("id, name").order("name"),
    getFinancialData(supabase),
  ]);

  return (
    <main>
      <ReportsClient
        students={studentsResult.data || []}
        payments={financialData.feePayments || []}
        transactions={financialData.transactions || []}
        incomeCategories={incomeCategoriesResult.data || []}
        expenseCategories={expenseCategoriesResult.data || []}
        userName={profile?.full_name || user?.email || ""}
      />
    </main>
  );
}
