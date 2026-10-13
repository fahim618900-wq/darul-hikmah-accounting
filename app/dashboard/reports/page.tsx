import { createClient } from "@/lib/supabase/server";
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

  const { data: students } = await supabase
    .from("students")
    .select("id, student_id, name, class_name, roll, section, monthly_fee, discount, status")
    .order("class_name")
    .order("roll");

  const { data: incomeCategories } = await supabase
    .from("income_categories")
    .select("id, name")
    .order("name");

  const { data: expenseCategories } = await supabase
    .from("expense_categories")
    .select("id, name")
    .order("name");

  const { data: payments } = await supabase
    .from("fee_payments")
    .select("*")
    .order("payment_date", { ascending: false });

  const { data: transactions } = await supabase
    .from("transactions_all")
    .select("*")
    .order("date", { ascending: false });

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <ReportsClient
        students={students || []}
        payments={payments || []}
        transactions={transactions || []}
        incomeCategories={incomeCategories || []}
        expenseCategories={expenseCategories || []}
        userName={profile?.full_name || user?.email || ""}
      />
    </main>
  );
}
