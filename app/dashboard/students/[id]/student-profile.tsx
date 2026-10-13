"use client";

import { useState } from "react";
import Link from "next/link";

type Student = {
  id: number;
  student_id: string | null;
  name: string;
  class_name: string;
  section: string | null;
  roll: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  address: string | null;
  admission_date: string | null;
  monthly_fee: number;
  discount: number;
  discount_reason: string | null;
  status: string;
};

type Payment = {
  id: number;
  month: number;
  year: number;
  amount: number;
  payment_date: string;
  receipt_no: string | null;
  payment_method: string;
  note: string | null;
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

function todayBangla(): string {
  const d = new Date();
  return `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())}`;
}

export default function StudentProfile({
  student,
  payments,
}: {
  student: Student;
  payments: Payment[];
}) {
  const [preparedBy, setPreparedBy] = useState("");

  const payable = Number(student.monthly_fee || 0) - Number(student.discount || 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* স্ক্রিনে ফিল্টার ও বাটন */}
      <div className="no-print">
        <Link
          href="/dashboard/students"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "#0f766e",
            fontSize: "0.9rem",
            marginBottom: "1.25rem",
            textDecoration: "none",
          }}
        >
          ← শিক্ষার্থী তালিকায় ফিরে যান
        </Link>

        <div style={{ background: "#ffffff", padding: "0.85rem 1rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.78rem", color: "#475569", fontWeight: "500" }}>
              প্রস্তুতকারীর নাম (প্রিন্টে দেখাবে)
            </label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="আপনার নাম"
              style={{ width: "100%", padding: "0.5rem 0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
            />
          </div>
          <button
            onClick={handlePrint}
            style={{ padding: "0.55rem 1.1rem", background: "#0f766e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.88rem", fontWeight: "500", cursor: "pointer" }}
          >
            🖨️ Print / PDF
          </button>
        </div>
      </div>

      <div className="print-area">
        {/* প্রিন্ট হেডার */}
        <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "8px 8px 0 0", borderBottom: "2px solid #0f766e", marginBottom: "1rem" }}>
          <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            <h1 style={{ fontSize: "1.4rem", color: "#0f766e", marginBottom: "0.25rem" }}>
              দারুল হিকমাহ মডেল মাদ্রাসা
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem", marginBottom: "0.35rem" }}>
            <div><strong>বিষয়:</strong> শিক্ষার্থীর বেতন পরিশোধের ইতিহাস</div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem" }}>
            <div><strong>শিক্ষার্থী:</strong> {student.name} — {student.class_name}{student.roll ? ` | রোল: ${student.roll}` : ""}</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        {/* শিক্ষার্থীর তথ্য */}
        <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", marginBottom: "1rem", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem", color: "#0f766e", marginBottom: "0.35rem" }}>
                {student.name}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                {student.class_name}
                {student.section && ` — শাখা: ${student.section}`}
                {student.roll && ` | রোল: ${student.roll}`}
                {student.student_id && ` | আইডি: ${student.student_id}`}
              </p>
            </div>
            <span
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
                fontWeight: "500",
                background: student.status === "active" ? "#dcfce7" : "#fee2e2",
                color: student.status === "active" ? "#15803d" : "#b91c1c",
              }}
            >
              {student.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem", fontSize: "0.85rem" }}>
            <Info label="অভিভাবকের নাম" value={student.guardian_name || "-"} />
            <Info label="অভিভাবকের ফোন" value={student.guardian_phone || "-"} />
            <Info label="মাসিক বেতন" value={`৳ ${toBangla(student.monthly_fee)}`} />
            <Info label="ছাড়" value={`৳ ${toBangla(student.discount || 0)}`} />
            <Info label="মাসিক প্রদেয়" value={`৳ ${toBangla(payable)}`} highlight />
            <Info label="মোট পরিশোধিত" value={`৳ ${toBangla(totalPaid)}`} highlight />
          </div>
        </div>

        {/* বেতন ইতিহাস */}
        <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem" }}>
          <h3 style={{ fontSize: "1rem", color: "#0f766e", marginBottom: "0.85rem" }}>
            বেতন পরিশোধের ইতিহাস ({toBangla(payments.length)}টি)
          </h3>

          {payments.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.9rem", padding: "1rem", background: "#f8fafc", borderRadius: "6px", textAlign: "center" }}>
              এখনো কোনো বেতন পরিশোধ করা হয়নি
            </p>
          ) : (
            <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
              <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#0f766e", color: "#fff" }}>
                    <th style={th}>নং</th>
                    <th style={th}>মাস</th>
                    <th style={th}>বছর</th>
                    <th style={th}>পরিমাণ</th>
                    <th style={th}>তারিখ</th>
                    <th style={th}>রসিদ নম্বর</th>
                    <th style={th}>পদ্ধতি</th>
                    <th style={th}>নোট</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={td}>{toBangla(i + 1)}</td>
                      <td style={td}>{MONTHS[p.month - 1]}</td>
                      <td style={td}>{toBangla(p.year)}</td>
                      <td style={{ ...td, color: "#15803d", fontWeight: "500" }}>
                        ৳ {toBangla(p.amount)}
                      </td>
                      <td style={td}>{toBangla(p.payment_date)}</td>
                      <td style={{ ...td, fontSize: "0.75rem", color: "#0f766e", fontWeight: "500" }}>
                        {p.receipt_no || "-"}
                      </td>
                      <td style={td}>
                        {p.payment_method === "cash" ? "নগদ" :
                         p.payment_method === "bkash" ? "বিকাশ" :
                         p.payment_method === "nagad" ? "নগদ (Nagad)" :
                         p.payment_method === "bank" ? "ব্যাংক" : "অন্যান্য"}
                      </td>
                      <td style={td}>{p.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f1f5f9", borderTop: "2px solid #0f766e" }}>
                    <td colSpan={3} style={{ ...td, fontWeight: "600", textAlign: "right" }}>মোট:</td>
                    <td style={{ ...td, fontWeight: "600", color: "#15803d" }}>৳ {toBangla(totalPaid)}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Info({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "0.2rem" }}>{label}</div>
      <div style={{ fontWeight: highlight ? "600" : "500", color: highlight ? "#0f766e" : "#1a1a1a" }}>{value}</div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "0.6rem 0.7rem", textAlign: "left", fontWeight: "600", fontSize: "0.75rem", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.6rem 0.7rem", color: "#1a1a1a" };
