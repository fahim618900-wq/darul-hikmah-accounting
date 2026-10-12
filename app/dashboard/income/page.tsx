import { createClient } from "@/lib/supabase/server";
import IncomeClient from "./income-client";

export default async function IncomePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("income_categories")
    .select("*")
    .order("name");

  const { data: incomes } = await supabase
    .from("incomes")
    .select("*, income_categories(name)")
    .order("entry_date", { ascending: false })
    .limit(50);

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "0.25rem" }}>
        আয় ব্যবস্থাপনা
      </h2>
      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        বেতন ছাড়া অন্যান্য সকল আয় এখানে লিখুন
      </p>

      <IncomeClient categories={categories || []} initialIncomes={incomes || []} />
    </main>
  );
}
