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
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

function toBangla(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())}`;
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
      const sp = payments.filter((p) => p.student_id === s.id);
      const paid = sp.reduce((sum, p) => sum + Number(p.amount), 0);
      const payable = Number(s.monthly_fee || 0) - Number(s.discount || 0);
      const due = payable - paid;

      let status: "paid" | "unpaid" | "partial";
      if (paid >= payable && payable > 0) status = "paid";
      else if (paid === 0) status = "unpaid";
      else status = "partial";

      return { student: s, payable, paid, due, status };
    });
  }, [students, payments]);

  const filtered = rows.filter((r) => {
    if (classFilter && r.student.class_name !== classFilter) return false;
    if (statusFilter === "paid" && r.status !== "paid") return false;
    if (statusFilter === "unpaid" && r.status === "paid") return false;
    if (statusFilter === "partial" && r.status !== "partial") return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.student.name.toLowerCase().includes(q) ||
        (r.student.student_id || "").toLowerCase().includes(q) ||
        (r.student.roll || "").toLowerCase().includes(q)
      );
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

  const today = formatDate(new Date().toISOString().split("T")[0]);

  function handlePrint() {
    window.print();
  }

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

      {/* স্ক্রিনে ফিল্টার */}
      <div className="no-print" style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1rem 0" }}>
        <h2 style={{ fontSize: "1.4rem", color: "#0f766e", marginBottom: "0.25rem" }}>
          Paid / Unpaid তালিকা
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
          মাস ও বছর নির্বাচন করে বেতন পরিশোধের অবস্থা দেখুন
        </p>

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
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={input} />
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
              <input type="text" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} style={input} />
            </div>
          </div>
          <button onClick={handlePrint} style={{ marginTop: "0.75rem", padding: "0.55rem 1.2rem", background: "#0f766e", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "0.9rem", fontWeight: "500", cursor: "pointer" }}>
            🖨️ Print / PDF
          </button>
        </div>

        {/* স্ক্রিনে সামারি */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <SumCard label="মোট শিক্ষার্থী" value={toBangla(filtered.length)} suffix="জন" color="#0f766e" />
          <SumCard label="মোট প্রাপ্য" value={`৳ ${toBangla(totalPayable)}`} color="#1e40af" />
          <SumCard label="মোট জমা" value={`৳ ${toBangla(totalPaid)}`} color="#15803d" />
          <SumCard label="মোট বকেয়া" value={`৳ ${toBangla(totalDue)}`} color="#b91c1c" />
        </div>
      </div>

      {/* প্রিন্ট ও স্ক্রিনে দেখানো তালিকা */}
      <div className="print-area" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem 2rem" }}>
        {/* হেডার — প্রিন্ট ও স্ক্রিন দুই জায়গায় */}
        <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "8px 8px 0 0", borderBottom: "2px solid #0f766e" }}>
          <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            <h1 style={{ fontSize: "1.4rem", color: "#0f766e", marginBottom: "0.25rem" }}>
              দারুল হিকমাহ মডেল মাদ্রাসা
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem", marginBottom: "0.35rem" }}>
            <div><strong>বিষয়:</strong> Paid / Unpaid তালিকা ({statusLabel})</div>
            <div><strong>তারিখ:</strong> {today}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem" }}>
            <div><strong>মাস:</strong> {MONTHS[month - 1]} {toBangla(year)}</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        {loading ? (
          <div style={{ background: "#ffffff", padding: "2rem", textAlign: "center", color: "#64748b" }}>লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "#ffffff", padding: "2rem", textAlign: "center", color: "#64748b" }}>কোনো ফলাফল পাওয়া যায়নি</div>
        ) : (
          <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "#0f766e", color: "#ffffff" }}>
                <th style={th}>নং</th>
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
                <tr key={r.student.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={td}>{toBangla(i + 1)}</td>
                  <td style={{ ...td, fontWeight: "500" }}>{r.student.name}</td>
                  <td style={td}>{r.student.class_name}{r.student.section ? ` (${r.student.section})` : ""}</td>
                  <td style={td}>{r.student.roll || "-"}</td>
                  <td style={td}>৳ {toBangla(r.payable)}</td>
                  <td style={{ ...td, color: "#15803d", fontWeight: "500" }}>৳ {toBangla(r.paid)}</td>
                  <td style={{ ...td, color: r.due > 0 ? "#b91c1c" : "#64748b", fontWeight: r.due > 0 ? "500" : "400" }}>৳ {toBangla(r.due)}</td>
                  <td style={td}>
                    <span style={{
                      padding: "0.15rem 0.5rem", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "500",
                      background: r.status === "paid" ? "#dcfce7" : r.status === "unpaid" ? "#fee2e2" : "#fef3c7",
                      color: r.status === "paid" ? "#15803d" : r.status === "unpaid" ? "#b91c1c" : "#b45309",
                    }}>
                      {r.status === "paid" ? "Paid" : r.status === "unpaid" ? "Unpaid" : "Partial"}
                    </span>
                  </td>
                  <td className="no-print" style={td}>
                    <button onClick={() => setDetailStudent(r.student)} style={{ padding: "0.3rem 0.7rem", background: "#ffffff", color: "#0f766e", border: "1px solid #0f766e", borderRadius: "4px", fontSize: "0.78rem", cursor: "pointer" }}>
                      বিস্তারিত
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f1f5f9", borderTop: "2px solid #0f766e" }}>
                <td colSpan={4} style={{ ...td, fontWeight: "600", textAlign: "right" }}>
                  মোট ({toBangla(filtered.length)} জন):
                </td>
                <td style={{ ...td, fontWeight: "600" }}>৳ {toBangla(totalPayable)}</td>
                <td style={{ ...td, fontWeight: "600", color: "#15803d" }}>৳ {toBangla(totalPaid)}</td>
                <td style={{ ...td, fontWeight: "600", color: "#b91c1c" }}>৳ {toBangla(totalDue)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

    
    </>
  );
}

function SumCard({ label, value, suffix, color }: { label: string; value: string; suffix?: string; color: string }) {
  return (
    <div style={{ background: "#ffffff", padding: "0.85rem", borderRadius: "8px", borderLeft: `4px solid ${color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.3rem" }}>{label}</div>
      <div style={{ fontSize: "1.05rem", fontWeight: "600", color }}>
        {value}{suffix && <span style={{ fontSize: "0.8rem", marginLeft: "0.2rem", color: "#64748b" }}>{suffix}</span>}
      </div>
    </div>
  );
}

const label: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.78rem", color: "#475569", fontWeight: "500" };
const input: React.CSSProperties = { width: "100%", padding: "0.5rem 0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", background: "#ffffff", fontFamily: "inherit" };
const th: React.CSSProperties = { padding: "0.7rem 0.85rem", textAlign: "left", fontWeight: "600", fontSize: "0.8rem", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.7rem 0.85rem", color: "#1a1a1a", verticalAlign: "top" };
