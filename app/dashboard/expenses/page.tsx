import { createClient } from "@/lib/supabase/server";
import ExpensesClient from "./expenses-client";

export default async function ExpensesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id)
    .single();

  const { data: categories } = await supabase
    .from("expense_categories")
    .select("*")
    .order("name");

  const { data: expensesRaw } = await supabase
    .from("expenses")
    .select("*, expense_categories(name)")
    .order("entry_date", { ascending: false })
    .limit(500);

  // Supabase relational normalize
  const expenses = (expensesRaw || []).map((e: any) => ({
    id: e.id,
    amount: e.amount,
    entry_date: e.entry_date,
    payment_method: e.payment_method,
    voucher_no: e.voucher_no,
    description: e.description,
    expense_categories: Array.isArray(e.expense_categories)
      ? e.expense_categories[0] || null
      : e.expense_categories,
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
