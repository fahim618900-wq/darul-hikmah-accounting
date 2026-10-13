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

  // চলতি বছরের সব পেমেন্ট
  const { data: payments } = await supabase
    .from("fee_payments")
    .select("student_id, amount, month, year, payment_date")
    .eq("year", currentYear);

  // চলতি মাসের আয়
  const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const monthEnd = new Date(currentYear, currentMonth, 0)
    .toISOString()
    .split("T")[0];

  const { data: incomesRaw } = await supabase
    .from("incomes")
    .select("amount, entry_date, category_id, income_categories(name)")
    .gte("entry_date", monthStart)
    .lte("entry_date", monthEnd);

  // Supabase relational data normalize
  const incomes = (incomesRaw || []).map((i: any) => ({
    amount: i.amount,
    entry_date: i.entry_date,
    category_id: i.category_id,
    income_categories: Array.isArray(i.income_categories)
      ? i.income_categories[0] || null
      : i.income_categories,
  }));

  // চলতি মাসের ব্যয়
  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, entry_date")
    .gte("entry_date", monthStart)
    .lte("entry_date", monthEnd);

  return (
    <DashboardClient
      students={students || []}
      payments={payments || []}
      incomes={incomes}
      expenses={expenses || []}
      userName={profile?.full_name || user?.email || "ব্যবহারকারী"}
      currentMonth={currentMonth}
      currentYear={currentYear}
    />
  );
}
