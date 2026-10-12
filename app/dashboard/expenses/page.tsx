import { createClient } from "@/lib/supabase/server";
import ExpensesClient from "./expenses-client";

export default async function ExpensesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("expense_categories")
    .select("*")
    .order("name");

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, expense_categories(name)")
    .order("entry_date", { ascending: false })
    .limit(50);

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "0.25rem" }}>
        ব্যয় ব্যবস্থাপনা
      </h2>
      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        মাদ্রাসার সকল ব্যয় এখানে লিখুন
      </p>

      <ExpensesClient categories={categories || []} initialExpenses={expenses || []} />
    </main>
  );
}
