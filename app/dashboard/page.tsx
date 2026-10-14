import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user?.id)
    .single();

  // শিক্ষার্থী
  const { data: students } = await supabase
    .from("students")
    .select("id, monthly_fee, discount, class_name, status")
    .eq("status", "active");

  // সব পেমেন্ট (সর্বশেষ ১০০০)
  const { data: allPayments } = await supabase
    .from("fee_payments")
    .select("student_id, amount, month, year, payment_date")
    .order("payment_date", { ascending: false })
    .limit(1000);

  // সব আয় (সর্বশেষ ৫০০)
  const { data: allIncomesRaw } = await supabase
    .from("incomes")
    .select("amount, entry_date, category_id, income_categories(name)")
    .order("entry_date", { ascending: false })
    .limit(500);

  const allIncomes = (allIncomesRaw || []).map((i: any) => ({
    amount: i.amount,
    entry_date: i.entry_date,
    category_id: i.category_id,
    income_categories: Array.isArray(i.income_categories)
      ? i.income_categories[0] || null
      : i.income_categories,
  }));

  // সব ব্যয় (সর্বশেষ ৫০০)
  const { data: allExpenses } = await supabase
    .from("expenses")
    .select("amount, entry_date, category_id, expense_categories(name)")
    .order("entry_date", { ascending: false })
    .limit(500);

  const expensesNormalized = (allExpenses || []).map((e: any) => ({
    amount: e.amount,
    entry_date: e.entry_date,
    category_id: e.category_id,
    expense_categories: Array.isArray(e.expense_categories)
      ? e.expense_categories[0] || null
      : e.expense_categories,
  }));

  return (
    <DashboardClient
      students={students || []}
      payments={allPayments || []}
      incomes={allIncomes}
      expenses={expensesNormalized}
      userName={profile?.full_name || user?.email || "ব্যবহারকারী"}
      currentMonth={currentMonth}
      currentYear={currentYear}
    />
  );
}
