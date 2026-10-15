import { createClient } from "@/lib/supabase/server";
import { getFinancialData } from "@/lib/financial";
import IncomeClient from "./income-client";

export default async function IncomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: categories }, financialData] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user?.id).single(),
    supabase.from("income_categories").select("*").order("name"),
    getFinancialData(supabase),
  ]);

  const incomes = (financialData.incomes || []).map((i: any) => ({
    id: i.id,
    amount: i.amount,
    entry_date: i.entry_date,
    payment_method: i.payment_method,
    receipt_no: i.receipt_no,
    description: i.description,
    income_categories: i.income_categories,
  }));

  return (
    <main>
      <IncomeClient
        categories={categories || []}
        initialIncomes={incomes}
        userName={profile?.full_name || user?.email || ""}
      />
    </main>
  );
}
