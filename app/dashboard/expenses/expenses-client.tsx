"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Category = { id: number; name: string };
type Expense = {
  id: number;
  amount: number;
  entry_date: string;
  payment_method: string;
  voucher_no: string | null;
  description: string | null;
  expense_categories: { name: string } | null;
};

export default function ExpensesClient({
  categories,
  initialExpenses,
}: {
  categories: Category[];
  initialExpenses: Expense[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [expenses, setExpenses] = useState(initialExpenses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category_id: categories[0]?.id || 0,
    amount: "",
    entry_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    voucher_no: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.from("expenses").insert({
      ...form,
      amount: Number(form.amount),
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setShowForm(false);
    setForm({ ...form, amount: "", voucher_no: "", description: "" });
    router.refresh();
    window.location.reload();
  }

  async function handleDelete(id: number) {
    if (!confirm("এই ব্যয় এন্ট্রি ডিলিট করতে চান?")) return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      alert("সমস্যা: " + error.message);
      return;
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    router.refresh();
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ background: "#fef2f2", padding: "0.75rem 1.25rem", borderRadius: "6px", border: "1px solid #fecaca" }}>
          <span style={{ fontSize: "0.85rem", color: "#b91c1c" }}>মোট ব্যয়: </span>
          <strong style={{ color: "#b91c1c", fontSize: "1.1rem" }}>৳ {total.toLocaleString("bn-BD")}</strong>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "0.65rem 1.25rem",
            background: "#0f766e",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.95rem",
            fontWeight: "500",
          }}
        >
          {showForm ? "বাতিল" : "+ নতুন ব্যয়"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.9rem" }}>
            <div>
              <label style={label}>খাত *</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })} required style={input}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={label}>পরিমাণ (৳) *</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min={1} style={input} />
            </div>
            <div>
              <label style={label}>তারিখ *</label>
              <input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} required style={input} />
            </div>
            <div>
              <label style={label}>পেমেন্ট পদ্ধতি</label>
              <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} style={input}>
                <option value="cash">নগদ</option>
                <option value="bkash">বিকাশ</option>
                <option value="nagad">নগদ (Nagad)</option>
                <option value="bank">ব্যাংক</option>
                <option value="other">অন্যান্য</option>
              </select>
            </div>
            <div>
              <label style={label}>ভাউচার নম্বর</label>
              <input type="text" value={form.voucher_no} onChange={(e) => setForm({ ...form, voucher_no: e.target.value })} style={input} />
            </div>
          </div>

          <div style={{ marginTop: "0.9rem" }}>
            <label style={label}>বিবরণ</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={input} />
          </div>

          {error && (
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ marginTop: "1rem", padding: "0.65rem 1.5rem", background: "#0f766e", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "500", opacity: loading ? 0.7 : 1 }}>
            {loading ? "সংরক্ষণ..." : "সংরক্ষণ করুন"}
          </button>
        </form>
      )}

      <div style={{ background: "#ffffff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <tr>
                <th style={th}>তারিখ</th>
                <th style={th}>খাত</th>
                <th style={th}>পরিমাণ</th>
                <th style={th}>পদ্ধতি</th>
                <th style={th}>ভাউচার</th>
                <th style={th}>বিবরণ</th>
                <th style={th}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...td, textAlign: "center", color: "#64748b", padding: "2rem" }}>
                    এখনো কোনো ব্যয় এন্ট্রি নেই
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={td}>{e.entry_date}</td>
                    <td style={td}>{e.expense_categories?.name || "-"}</td>
                    <td style={{ ...td, fontWeight: "500", color: "#b91c1c" }}>৳ {Number(e.amount).toLocaleString("bn-BD")}</td>
                    <td style={td}>{e.payment_method}</td>
                    <td style={td}>{e.voucher_no || "-"}</td>
                    <td style={td}>{e.description || "-"}</td>
                    <td style={td}>
                      <button onClick={() => handleDelete(e.id)} style={btnDelete}>ডিলিট</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const label: React.CSSProperties = { display: "block", marginBottom: "0.35rem", fontSize: "0.85rem", color: "#475569", fontWeight: "500" };
const input: React.CSSProperties = { width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.9rem", fontFamily: "inherit" };
const th: React.CSSProperties = { padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#475569", fontSize: "0.85rem", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.75rem 1rem", color: "#1a1a1a" };
const btnDelete: React.CSSProperties = { padding: "0.35rem 0.7rem", background: "#ffffff", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: "4px", fontSize: "0.8rem" };
