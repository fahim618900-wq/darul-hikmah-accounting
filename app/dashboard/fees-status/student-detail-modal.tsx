"use client";

import type { CSSProperties } from "react";
import Link from "next/link";

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
  month: number;
  year: number;
  amount: number;
  payment_date: string;
  receipt_no: string | null;
  payment_method: string;
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল",
  "মে", "জুন", "জুলাই", "আগস্ট",
  "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const money = (amount: number) => `৳ ${amount.toLocaleString("bn-BD")}`;

export default function StudentDetailModal({
  student,
  payments,
  month,
  year,
  onClose,
}: {
  student: Student;
  payments: Payment[];
  month: number;
  year: number;
  onClose: () => void;
}) {
  const payable = Math.max(0, Number(student.monthly_fee || 0) - Number(student.discount || 0));
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const due = Math.max(0, payable - totalPaid);

  function paymentMethod(method: string) {
    switch (method) {
      case "cash": return "নগদ";
      case "bkash": return "বিকাশ";
      case "nagad": return "নগদ";
      case "bank": return "ব্যাংক";
      default: return "অন্যান্য";
    }
  }

  return (
    <div onClick={onClose} style={overlay}>
      <section
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={modal}
      >
        <header style={header}>
          <div>
            <h3 style={title}>{student.name}</h3>
            <p style={muted}>
              {student.class_name}
              {student.section ? ` · ${student.section}` : ""}
              {student.roll ? ` · রোল: ${student.roll}` : ""}
            </p>
            <p style={muted}>শিক্ষার্থী আইডি: {student.student_id || "—"}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="বন্ধ করুন" style={closeButton}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          </button>
        </header>

        <h4 style={subTitle}>{MONTHS[month - 1]} {year} মাসের হিসাব</h4>

        <div style={summaryGrid}>
          <MiniCard label="নির্ধারিত ফি" value={payable} />
          <MiniCard label="মোট জমা" value={totalPaid} color="#15803d" />
          <MiniCard label="বকেয়া" value={due} color="#b91c1c" />
        </div>

        <h4 style={subTitle}>পেমেন্ট হিস্ট্রি ({payments.length}টি)</h4>

        {payments.length === 0 ? (
          <p style={empty}>এই মাসে কোনো পেমেন্ট পাওয়া যায়নি।</p>
        ) : (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>তারিখ</th>
                  <th style={th}>পরিমাণ</th>
                  <th style={th}>রসিদ</th>
                  <th style={th}>পদ্ধতি</th>
                  <th style={th}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td style={td}>{payment.payment_date}</td>
                    <td style={{ ...td, color: "#15803d" }}>{money(Number(payment.amount))}</td>
                    <td style={td}>{payment.receipt_no || "—"}</td>
                    <td style={td}>{paymentMethod(payment.payment_method)}</td>
                    <td style={td}>
                      <Link
                        href={`/dashboard/fees/receipt?id=${payment.id}`}
                        style={{ padding: "0.25rem 0.55rem", background: "#ffffff", color: "#0f766e", border: "1px solid #0f766e", borderRadius: "4px", fontSize: "0.72rem", textDecoration: "none", display: "inline-block" }}
                      >
                        রসিদ
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer style={footer}>
          <button type="button" onClick={onClose} style={closeAction}>
            বন্ধ করুন
          </button>
        </footer>
      </section>
    </div>
  );
}

function MiniCard({ label, value, color = "#1e293b" }: { label: string; value: number; color?: string }) {
  return (
    <div style={miniCard}>
      <span style={muted}>{label}</span>
      <strong style={{ color, fontSize: "0.92rem" }}>{money(value)}</strong>
    </div>
  );
}

const overlay: CSSProperties = {
  position: "fixed", inset: 0, zIndex: 100,
  background: "rgba(15,23,42,0.55)",
  display: "flex", justifyContent: "center", alignItems: "flex-start",
  padding: "18px 10px", overflowY: "auto",
};
const modal: CSSProperties = {
  width: "100%", maxWidth: 720, background: "#fff",
  borderRadius: 10, padding: 16, boxSizing: "border-box",
  boxShadow: "0 12px 35px rgba(0,0,0,0.18)",
};
const header: CSSProperties = {
  display: "flex", justifyContent: "space-between",
  alignItems: "flex-start", gap: 12, paddingBottom: 12,
  borderBottom: "1px solid #e2e8f0",
};
const title: CSSProperties = { margin: "0 0 5px", fontSize: "1.1rem", color: "#0f766e" };
const muted: CSSProperties = { margin: "3px 0", fontSize: "0.78rem", color: "#64748b" };
const closeButton: CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  padding: 5, border: "1px solid #e2e8f0", borderRadius: 5,
  background: "#fff", color: "#475569", cursor: "pointer",
};
const subTitle: CSSProperties = { margin: "16px 0 10px", fontSize: "0.92rem", color: "#334155" };
const summaryGrid: CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8,
};
const miniCard: CSSProperties = {
  display: "grid", gap: 7, padding: 10, background: "#f8fafc",
  border: "1px solid #e2e8f0", borderRadius: 7, minWidth: 0,
};
const tableWrap: CSSProperties = {
  overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 7,
};
const table: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" };
const th: CSSProperties = {
  textAlign: "left", padding: "9px 8px", background: "#f8fafc",
  whiteSpace: "nowrap", color: "#475569",
};
const td: CSSProperties = {
  padding: "9px 8px", borderTop: "1px solid #f1f5f9",
  color: "#334155", whiteSpace: "nowrap",
};
const empty: CSSProperties = {
  textAlign: "center", padding: 20, background: "#f8fafc",
  borderRadius: 7, color: "#64748b", fontSize: "0.85rem",
};
const footer: CSSProperties = { display: "flex", justifyContent: "flex-end", marginTop: 16 };
const closeAction: CSSProperties = {
  padding: "7px 12px", border: "1px solid #cbd5e1",
  borderRadius: 6, background: "#fff", color: "#334155",
  fontSize: "0.8rem", cursor: "pointer",
};
