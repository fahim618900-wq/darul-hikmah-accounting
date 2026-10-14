import { createClient } from "@/lib/supabase/server";
import IncomeClient from "./income-client";

export default async function IncomePage() {
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
    .from("income_categories")
    .select("*")
    .order("name");

  const { data: incomesRaw } = await supabase
    .from("incomes")
    .select("*, income_categories(name)")
    .order("entry_date", { ascending: false })
    .limit(500);

  const incomes = (incomesRaw || []).map((i: any) => ({
    id: i.id,
    amount: i.amount,
    entry_date: i.entry_date,
    payment_method: i.payment_method,
    receipt_no: i.receipt_no,
    description: i.description,
    income_categories: Array.isArray(i.income_categories)
      ? i.income_categories[0] || null
      : i.income_categories,
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
