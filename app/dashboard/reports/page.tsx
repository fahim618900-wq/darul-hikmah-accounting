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
    .eq("status", "active")
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

  // ইভেন্ট ডেটা
  const { data: events } = await supabase
    .from("madrasah_events")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: eventFees } = await supabase
    .from("event_student_fees")
    .select("*, students(id, name, class_name, roll, section, photo_url)");

  const { data: eventPayments } = await supabase
    .from("event_payments")
    .select("*");

  return (
    <main>
      <ReportsClient
        students={students || []}
        payments={payments || []}
        transactions={transactions || []}
        incomeCategories={incomeCategories || []}
        expenseCategories={expenseCategories || []}
        userName={profile?.full_name || user?.email || ""}
        events={events || []}
        eventFees={eventFees || []}
        eventPayments={eventPayments || []}
      />
    </main>
  );
}
