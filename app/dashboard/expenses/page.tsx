import { createClient } from "@/lib/supabase/server";
import { getFinancialData } from "@/lib/financial";
import ExpensesClient from "./expenses-client";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: categories }, financialData] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user?.id).single(),
    supabase.from("expense_categories").select("*").order("name"),
    getFinancialData(supabase),
  ]);

  const expenses = (financialData.expenses || []).map((e: any) => ({
    id: e.id,
    amount: e.amount,
    entry_date: e.entry_date,
    payment_method: e.payment_method,
    voucher_no: e.voucher_no,
    description: e.description,
    expense_categories: e.expense_categories,
  }));

  return (
    <main>
      <ExpensesClient
        categories={categories || []}
        initialExpenses={expenses}
        userName={profile?.full_name || user?.email || ""}
      />
    </main>
  );
}
