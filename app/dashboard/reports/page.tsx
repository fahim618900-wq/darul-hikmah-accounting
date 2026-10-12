import { createClient } from "@/lib/supabase/server";

export default async function ReportsPage() {
  const supabase = await createClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const monthEnd = new Date(currentYear, currentMonth, 0).toISOString().split("T")[0];

  const { data: students } = await supabase.from("students").select("monthly_fee, discount, class_name").eq("status", "active");
  const { data: payments } = await supabase.from("fee_payments").select("amount").eq("month", currentMonth).eq("year", currentYear);
  const { data: incomes } = await supabase.from("incomes").select("amount").gte("entry_date", monthStart).lte("entry_date", monthEnd);
  const { data: expenses } = await supabase.from("expenses").select("amount").gte("entry_date", monthStart).lte("entry_date", monthEnd);

  const totalPayable = students?.reduce((s, x) => s + Number(x.monthly_fee) - Number(x.discount || 0), 0) || 0;
  const totalCollected = payments?.reduce((s, x) => s + Number(x.amount), 0) || 0;
  const totalIncome = incomes?.reduce((s, x) => s + Number(x.amount), 0) || 0;
  const totalExpense = expenses?.reduce((s, x) => s + Number(x.amount), 0) || 0;
  const monthName = now.toLocaleString("bn-BD", { month: "long" });

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "1.5rem" }}>
        রিপোর্ট — {monthName} {currentYear}
      </h2>

      <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#0f766e" }}>মাসিক সারসংক্ষেপ</h3>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
          <tbody>
            <Row label="প্রাপ্য বেতন" value={totalPayable} />
            <Row label="আদায়কৃত বেতন" value={totalCollected} color="#15803d" />
            <Row label="বাকি বেতন" value={totalPayable - totalCollected} color="#b91c1c" />
            <Row label="অন্যান্য আয়" value={totalIncome} color="#15803d" />
            <Row label="মোট ব্যয়" value={totalExpense} color="#b91c1c" />
            <Row label="নিট ব্যালেন্স" value={totalCollected + totalIncome - totalExpense} bold />
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Row({ label, value, color, bold }: { label: string; value: number; color?: string; bold?: boolean }) {
  return (
    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
      <td style={{ padding: "0.75rem 0", color: "#475569", fontWeight: bold ? "600" : "400" }}>{label}</td>
      <td style={{ padding: "0.75rem 0", textAlign: "right", fontWeight: bold ? "700" : "500", color: color || "#1a1a1a" }}>
        ৳ {value.toLocaleString("bn-BD")}
      </td>
    </tr>
  );
}
