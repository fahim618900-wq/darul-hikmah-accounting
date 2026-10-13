"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import StudentDetailModal from "./student-detail-modal";

type Student = {
  id: number;
  student_id: string | null;
  name: string;
  class_name: string;
  section: string | null;
  roll: string | null;
  monthly_fee: number;
  discount: number;
};

type Payment = {
  id: number;
  student_id: number;
  month: number;
  year: number;
  amount: number;
  payment_date: string;
  receipt_no: string | null;
  payment_method: string;
};

type Row = {
  student: Student;
  payable: number;
  paid: number;
  due: number;
  status: "paid" | "unpaid" | "partial";
  lastPaymentDate: string | null;
  lastReceiptNo: string | null;
  payments: Payment[];
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
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("fee_payments")
        .select("*")
        .eq("month", month)
        .eq("year", year);

      setPayments(data || []);
      setLoading(false);
    }
    load();
  }, [month, year]);

  const classes = Array.from(new Set(students.map((s) => s.class_name)));

  const rows: Row[] = useMemo(() => {
    return students.map((s) => {
      const studentPayments = payments.filter((p) => p.student_id === s.id);
      const paid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const payable = Number(s.monthly_fee || 0) - Number(s.discount || 0);
      const due = payable - paid;

      let status: "paid" | "unpaid" | "partial";
      if (paid >= payable && payable > 0) status = "paid";
      else if (paid === 0) status = "unpaid";
      else status = "partial";

      const sorted = [...studentPayments].sort(
        (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      );

      return {
        student: s,
        payable,
        paid,
        due,
        status,
        lastPaymentDate: sorted[0]?.payment_date || null,
        lastReceiptNo: sorted[0]?.receipt_no || null,
        payments: sorted,
      };
    });
  }, [students, payments]);

  const filtered = rows.filter((r) => {
    if (classFilter && r.student.class_name !== classFilter) return false;

    // Status filter: Unpaid-এ Partial + Unpaid দুইটিই থাকবে
    if (statusFilter === "paid" && r.status !== "paid") return false;
    if (statusFilter === "unpaid" && r.status === "paid") return false;
    if (statusFilter === "partial" && r.status !== "partial") return false;

    if (search) {
      const q = search.toLowerCase();
      const match =
        r.student.name.toLowerCase().includes(q) ||
        (r.student.student_id || "").toLowerCase().includes(q) ||
        (r.student.roll || "").toLowerCase().includes(q);
      if (!match) return false;
    }

    if (dateFrom && r.lastPaymentDate && r.lastPaymentDate < dateFrom) return false;
    if (dateTo && r.lastPaymentDate && r.lastPaymentDate > dateTo) return false;

    return true;
  });

  const paidCount = rows.filter((r) => r.status === "paid").length;
  const partialCount = rows.filter((r) => r.status === "partial").length;
  const unpaidOnly = rows.filter((r) => r.status === "unpaid").length;
  const totalPayable = rows.reduce((sum, r) => sum + r.payable, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.paid, 0);
  const totalDue = rows.reduce((sum, r) => sum + r.due, 0);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {detailStudent && (
        <StudentDetailModal
          student={detailStudent}
          payments={payments.filter((p) => p.student_id === detailStudent.id)}
          onClose={() => setDetailStudent(null)}
        />
      )}

      {/* প্রিন্টে লুকানোর জন্য no-print ক্লাস */}
      <div className="no-print">
        {/* সারাংশ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <SummaryCard label="মোট শিক্ষার্থী" value={students.length} color="#0f766e" isCount />
          <SummaryCard label="Paid" value={paidCount} color="#15803d" isCount />
          <SummaryCard label="Partial" value={partialCount} color="#b45309" isCount />
          <SummaryCard label="সম্পূর্ণ বাকি" value={unpaidOnly} color="#b91c1c" isCount />
          <SummaryCard label="মোট প্রাপ্য" value={totalPayable} color="#1e40af" />
          <SummaryCard label="মোট আদায়" value={totalPaid} color="#15803d" />
          <SummaryCard label="মোট বাকি" value={totalDue} color="#b91c1c" />
        </div>

        {/* ফিল্টার */}
        <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
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
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid (বাকি সব)</option>
                <option value="partial">Partial only</option>
              </select>
            </div>
            <div>
              <label style={label}>তারিখ থেকে</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={input} />
            </div>
            <div>
              <label style={label}>তারিখ পর্যন্ত</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={input} />
            </div>
            <div>
              <label style={label}>খুঁজুন</label>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম / আইডি / রোল" style={input} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
              <button onClick={handlePrint} style={btnPrint}>
                🖨️ Print / PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* প্রিন্ট হেডার */}
      <div className="print-only" style={{ display: "none", marginBottom: "1rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>দারুল হিকমাহ মডেল মাদ্রাসা</h1>
        <p style={{ fontSize: "0.85rem", color: "#666" }}>ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ</p>
        <h2 style={{ fontSize: "1rem", marginTop: "0.75rem" }}>
          {MONTHS[month - 1]} {year} — Paid/Unpaid তালিকা
        </h2>
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
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <tr>
                  <th style={th}>শিক্ষার্থী</th>
                  <th style={th}>শ্রেণি / শাখা</th>
                  <th style={th}>নির্ধারিত ফি</th>
                  <th style={th}>জমা</th>
                  <th style={th}>বাকি</th>
                  <th style={th}>স্ট্যাটাস</th>
                  <th style={th}>শেষ জমার তারিখ</th>
                  <th style={th}>রসিদ</th>
                  <th className="no-print" style={th}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.student.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={td}>
                      <div style={{ fontWeight: "500" }}>{r.student.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {r.student.student_id ? `আইডি: ${r.student.student_id}` : `রোল: ${r.student.roll || "-"}`}
                      </div>
                    </td>
                    <td style={td}>
                      {r.student.class_name}
                      {r.student.section && <span style={{ color: "#64748b" }}> — {r.student.section}</span>}
                    </td>
                    <td style={td}>৳ {r.payable.toLocaleString("bn-BD")}</td>
                    <td style={{ ...td, color: "#15803d", fontWeight: "500" }}>
                      ৳ {r.paid.toLocaleString("bn-BD")}
                    </td>
                    <td style={{ ...td, color: r.due > 0 ? "#b91c1c" : "#64748b", fontWeight: r.due > 0 ? "500" : "400" }}>
                      ৳ {r.due.toLocaleString("bn-BD")}
                    </td>
                    <td style={td}>
                      <span style={{
                        padding: "0.2rem 0.55rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        background: r.status === "paid" ? "#dcfce7" : r.status === "unpaid" ? "#fee2e2" : "#fef3c7",
                        color: r.status === "paid" ? "#15803d" : r.status === "unpaid" ? "#b91c1c" : "#b45309",
                      }}>
                        {r.status === "paid" ? "Paid" : r.status === "unpaid" ? "Unpaid" : "Partial"}
                      </span>
                    </td>
                    <td style={td}>{r.lastPaymentDate || "-"}</td>
                    <td style={td}>{r.lastReceiptNo || "-"}</td>
                    <td className="no-print" style={td}>
                      <button onClick={() => setDetailStudent(r.student)} style={btnDetail}>
                        বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
        }
      `}</style>
    </>
  );
}

function SummaryCard({ label, value, color, isCount }: { label: string; value: number; color: string; isCount?: boolean }) {
  return (
    <div style={{ background: "#ffffff", padding: "0.85rem", borderRadius: "8px", borderLeft: `4px solid ${color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.3rem" }}>{label}</div>
      <div style={{ fontSize: "1.05rem", fontWeight: "600", color }}>
        {isCount ? value : `৳ ${value.toLocaleString("bn-BD")}`}
        {isCount && <span style={{ fontSize: "0.8rem", marginLeft: "0.2rem", color: "#64748b" }}>জন</span>}
      </div>
    </div>
  );
}

const label: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.78rem", color: "#475569", fontWeight: "500" };
const input: React.CSSProperties = { width: "100%", padding: "0.5rem 0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", background: "#ffffff", fontFamily: "inherit" };
const th: React.CSSProperties = { padding: "0.7rem 0.85rem", textAlign: "left", fontWeight: "600", color: "#475569", fontSize: "0.8rem", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.7rem 0.85rem", color: "#1a1a1a", verticalAlign: "top" };
const btnDetail: React.CSSProperties = { padding: "0.3rem 0.7rem", background: "#ffffff", color: "#0f766e", border: "1px solid #0f766e", borderRadius: "4px", fontSize: "0.78rem", cursor: "pointer" };
const btnPrint: React.CSSProperties = { width: "100%", padding: "0.55rem 0.9rem", background: "#0f766e", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "500", cursor: "pointer" };
