"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: number;
  name: string;
  class_name: string;
  roll: string | null;
  section: string | null;
  monthly_fee: number;
  discount: number;
};

type Payment = {
  student_id: number;
  amount: number;
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

export default function FeesStatusClient({ students }: { students: Student[] }) {
  const supabase = createClient();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid" | "partial">("all");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("fee_payments")
        .select("student_id, amount")
        .eq("month", month)
        .eq("year", year);

      setPayments(data || []);
      setLoading(false);
    }
    load();
  }, [month, year]);

  const classes = Array.from(new Set(students.map((s) => s.class_name)));

  // প্রতিটি শিক্ষার্থীর পরিশোধিত পরিমাণ
  const paymentMap: Record<number, number> = {};
  payments.forEach((p) => {
    paymentMap[p.student_id] = (paymentMap[p.student_id] || 0) + Number(p.amount);
  });

  // হিসাব
  const rows = students.map((s) => {
    const payable = Number(s.monthly_fee || 0) - Number(s.discount || 0);
    const paid = paymentMap[s.id] || 0;
    const due = payable - paid;
    let status: "paid" | "unpaid" | "partial";
    if (paid >= payable && payable > 0) status = "paid";
    else if (paid === 0) status = "unpaid";
    else status = "partial";
    return { student: s, payable, paid, due, status };
  });

  const filtered = rows.filter((r) => {
    if (classFilter && r.student.class_name !== classFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const paidCount = rows.filter((r) => r.status === "paid").length;
  const unpaidCount = rows.filter((r) => r.status === "unpaid").length;
  const partialCount = rows.filter((r) => r.status === "partial").length;
  const totalPayable = rows.reduce((sum, r) => sum + r.payable, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.paid, 0);
  const totalDue = rows.reduce((sum, r) => sum + r.due, 0);

  return (
    <>
      {/* সারসংক্ষেপ কার্ড */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <SummaryCard label="মোট প্রাপ্য" value={totalPayable} color="#1e40af" />
        <SummaryCard label="মোট আদায়" value={totalPaid} color="#15803d" />
        <SummaryCard label="মোট বাকি" value={totalDue} color="#b91c1c" />
        <SummaryCard label="Paid" value={paidCount} color="#15803d" isCount />
        <SummaryCard label="Unpaid" value={unpaidCount} color="#b91c1c" isCount />
        <SummaryCard label="Partial" value={partialCount} color="#b45309" isCount />
      </div>

      {/* ফিল্টার */}
      <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
          <div>
            <label style={label}>মাস</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={input}>
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>বছর</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min={2020} max={2100} style={input} />
          </div>
          <div>
            <label style={label}>শ্রেণি</label>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={input}>
              <option value="">সব শ্রেণি</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>স্ট্যাটাস</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} style={input}>
              <option value="all">সব</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "8px", textAlign: "center", color: "#64748b" }}>
          কোনো ফলাফল পাওয়া যায়নি
        </div>
      ) : (
        <div style={{ background: "#ffffff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <tr>
                  <th style={th}>নাম</th>
                  <th style={th}>শ্রেণি</th>
                  <th style={th}>রোল</th>
                  <th style={th}>প্রাপ্য</th>
                  <th style={th}>পরিশোধিত</th>
                  <th style={th}>বাকি</th>
                  <th style={th}>স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.student.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ ...td, fontWeight: "500" }}>{r.student.name}</td>
                    <td style={td}>{r.student.class_name}</td>
                    <td style={td}>{r.student.roll || "-"}</td>
                    <td style={td}>৳ {r.payable.toLocaleString("bn-BD")}</td>
                    <td style={{ ...td, color: "#15803d", fontWeight: "500" }}>৳ {r.paid.toLocaleString("bn-BD")}</td>
                    <td style={{ ...td, color: r.due > 0 ? "#b91c1c" : "#64748b", fontWeight: r.due > 0 ? "500" : "400" }}>
                      ৳ {r.due.toLocaleString("bn-BD")}
                    </td>
                    <td style={td}>
                      <span style={{
                        padding: "0.2rem 0.55rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        background: r.status === "paid" ? "#dcfce7" : r.status === "unpaid" ? "#fee2e2" : "#fef3c7",
                        color: r.status === "paid" ? "#15803d" : r.status === "unpaid" ? "#b91c1c" : "#b45309",
                      }}>
                        {r.status === "paid" ? "Paid" : r.status === "unpaid" ? "Unpaid" : "Partial"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function SummaryCard({ label, value, color, isCount }: { label: string; value: number; color: string; isCount?: boolean }) {
  return (
    <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", borderLeft: `4px solid ${color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.35rem" }}>{label}</div>
      <div style={{ fontSize: "1.15rem", fontWeight: "600", color }}>
        {isCount ? value : `৳ ${value.toLocaleString("bn-BD")}`}
        {isCount && <span style={{ fontSize: "0.85rem", marginLeft: "0.25rem", color: "#64748b" }}>জন</span>}
      </div>
    </div>
  );
}

const label: React.CSSProperties = { display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", color: "#475569", fontWeight: "500" };
const input: React.CSSProperties = { width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.9rem", background: "#ffffff", fontFamily: "inherit" };
const th: React.CSSProperties = { padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#475569", fontSize: "0.85rem", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.75rem 1rem", color: "#1a1a1a" };
