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

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toBanglaDigits(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

function formatDateBangla(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${toBanglaDigits(day)}/${toBanglaDigits(month)}/${toBanglaDigits(year)}`;
}

export default function FeesStatusClient({
  students,
  userName,
}: {
  students: Student[];
  userName: string;
}) {
  const supabase = createClient();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid" | "partial">("all");
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [preparedBy, setPreparedBy] = useState(userName);

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
    return true;
  });

  const totalPayable = filtered.reduce((sum, r) => sum + r.payable, 0);
  const totalPaid = filtered.reduce((sum, r) => sum + r.paid, 0);
  const totalDue = filtered.reduce((sum, r) => sum + r.due, 0);

  const statusLabel =
    statusFilter === "all" ? "All" :
    statusFilter === "paid" ? "Paid" :
    statusFilter === "unpaid" ? "Unpaid" : "Partial";

  function handlePrint() {
    window.print();
  }

  const todayFormatted = formatDateBangla(new Date().toISOString().split("T")[0]);

  return (
    <>
      {detailStudent && (
  <StudentDetailModal
    student={detailStudent}
    payments={payments.filter((p) => p.student_id === detailStudent.id)}
    month={month}
    year={year}
    onClose={() => setDetailStudent(null)}
  />
)}

      {/* স্ক্রিনে ফিল্টার ও নিয়ন্ত্রণ */}
      <div className="no-print">
        {/* ফিল্টার বার */}
        <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
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
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div>
              <label style={label}>খুঁজুন</label>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম / আইডি / রোল" style={input} />
            </div>
            <div>
              <label style={label}>প্রস্তুতকারীর নাম</label>
              <input type="text" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} placeholder="নাম লিখুন" style={input} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button onClick={handlePrint} style={btnPrimary}>
              🖨️ Print / PDF
            </button>
          </div>
        </div>

        {/* স্ক্রিনে সামারি কার্ড */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <SummaryCard label="মোট শিক্ষার্থী" value={filtered.length} color="#0f766e" isCount />
          <SummaryCard label="মোট প্রাপ্য" value={totalPayable} color="#1e40af" />
          <SummaryCard label="মোট জমা" value={totalPaid} color="#15803d" />
          <SummaryCard label="মোট বকেয়া" value={totalDue} color="#b91c1c" />
        </div>
      </div>

      {/* প্রিন্ট হেডার (স্ক্রিনে দেখাবে, তবে প্রিন্টেও আসবে) */}
      <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h1 style={{ fontSize: "1.3rem", color: "#0f766e", marginBottom: "0.3rem" }}>
            দারুল হিকমাহ মডেল মাদ্রাসা
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem", color: "#1a1a1a", marginBottom: "0.5rem" }}>
          <div><strong>বিষয়:</strong> Paid / Unpaid তালিকা ({statusLabel})</div>
          <div><strong>তারিখ:</strong> {todayFormatted}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem", color: "#1a1a1a", marginBottom: "0.75rem" }}>
          <div><strong>মাস:</strong> {MONTHS[month - 1]} {toBanglaDigits(year)}</div>
          <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
        </div>

        {/* চিকন লাইন */}
        <hr style={{ border: "none", borderTop: "1px solid #cbd5e1", margin: "0.75rem 0" }} />
      </div>

      {/* তালিকা */}
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
                  <th style={{ ...th, width: "50px" }}>নং</th>
                  <th style={th}>নাম</th>
                  <th style={th}>শ্রেণি</th>
                  <th style={th}>রোল</th>
                  <th style={th}>নির্ধারিত</th>
                  <th style={th}>জমা</th>
                  <th style={th}>বকেয়া</th>
                  <th style={th}>স্ট্যাটাস</th>
                  <th className="no-print" style={th}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.student.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={td}>{toBanglaDigits(i + 1)}</td>
                    <td style={{ ...td, fontWeight: "500" }}>
                      {r.student.name}
                      {r.student.student_id && (
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>আইডি: {r.student.student_id}</div>
                      )}
                    </td>
                    <td style={td}>
                      {r.student.class_name}
                      {r.student.section && <span style={{ color: "#64748b" }}> ({r.student.section})</span>}
                    </td>
                    <td style={td}>{r.student.roll || "-"}</td>
                    <td style={td}>৳ {toBanglaDigits(r.payable.toLocaleString("en-US"))}</td>
                    <td style={{ ...td, color: "#15803d", fontWeight: "500" }}>
                      ৳ {toBanglaDigits(r.paid.toLocaleString("en-US"))}
                    </td>
                    <td style={{ ...td, color: r.due > 0 ? "#b91c1c" : "#64748b", fontWeight: r.due > 0 ? "500" : "400" }}>
                      ৳ {toBanglaDigits(r.due.toLocaleString("en-US"))}
                    </td>
                    <td style={td}>
                      <span style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.72rem",
                        fontWeight: "500",
                        background: r.status === "paid" ? "#dcfce7" : r.status === "unpaid" ? "#fee2e2" : "#fef3c7",
                        color: r.status === "paid" ? "#15803d" : r.status === "unpaid" ? "#b91c1c" : "#b45309",
                      }}>
                        {r.status === "paid" ? "Paid" : r.status === "unpaid" ? "Unpaid" : "Partial"}
                      </span>
                    </td>
                    <td className="no-print" style={td}>
                      <button onClick={() => setDetailStudent(r.student)} style={btnDetail}>
                        বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f1f5f9", borderTop: "2px solid #cbd5e1" }}>
                  <td colSpan={4} style={{ ...td, fontWeight: "600", textAlign: "right" }}>
                    মোট ({toBanglaDigits(filtered.length)} জন):
                  </td>
                  <td style={{ ...td, fontWeight: "600" }}>৳ {toBanglaDigits(totalPayable.toLocaleString("en-US"))}</td>
                  <td style={{ ...td, fontWeight: "600", color: "#15803d" }}>৳ {toBanglaDigits(totalPaid.toLocaleString("en-US"))}</td>
                  <td style={{ ...td, fontWeight: "600", color: "#b91c1c" }}>৳ {toBanglaDigits(totalDue.toLocaleString("en-US"))}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* প্রিন্টে এই স্টাইলগুলো */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          body { background: white !important; }
          .no-print { display: none !important; }
          table { font-size: 11px !important; }
          th, td { padding: 4px 6px !important; }
          h1 { font-size: 16px !important; }
          .container { max-width: 100% !important; padding: 0 !important; }
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
        {isCount ? toBanglaDigits(value) : `৳ ${toBanglaDigits(value.toLocaleString("en-US"))}`}
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
const btnPrimary: React.CSSProperties = { padding: "0.55rem 1.1rem", background: "#0f766e", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "0.88rem", fontWeight: "500", cursor: "pointer" };
