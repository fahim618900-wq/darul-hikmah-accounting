"use client";

import { useState, useEffect } from "react";
import { numberToBanglaWords, toBanglaDigits, formatDateBangla } from "@/lib/number-to-bangla-words";

type Payment = {
  id: number;
  student_id: number;
  month: number;
  year: number;
  amount: number;
  payment_date: string;
  receipt_no: string | null;
  payment_method: string;
  note: string | null;
};

type Student = {
  id: number;
  name: string;
  student_id: string | null;
  class_name: string;
  section: string | null;
  roll: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

export default function ReceiptModal({
  payment,
  student,
  onClose,
}: {
  payment: Payment;
  student: Student;
  onClose: () => void;
}) {
  const [preparedBy, setPreparedBy] = useState("");

  function handlePrint() {
    window.print();
  }

  function paymentMethodLabel(method: string): string {
    switch (method) {
      case "cash": return "নগদ";
      case "bkash": return "বিকাশ";
      case "nagad": return "নগদ (Nagad)";
      case "bank": return "ব্যাংক";
      default: return "অন্যান্য";
    }
  }

  return (
    <>
      {/* স্ক্রিনে কন্ট্রোল (প্রিন্টে আসবে না) */}
      <div
        className="no-print"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 100,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "2rem 1rem",
          overflowY: "auto",
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            padding: "1.5rem",
            maxWidth: "220mm",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <h3 style={{ fontSize: "1.1rem", color: "#0f766e" }}>বেতন রসিদ</h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={handlePrint} style={btnPrimary}>
                🖨️ Print / PDF
              </button>
              <button onClick={onClose} style={btnSecondary}>
                বন্ধ করুন
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: "0.3rem", fontWeight: "500" }}>
              প্রস্তুতকারীর নাম (রসিদে দেখাবে)
            </label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="যিনি টাকা গ্রহণ করেছেন"
              style={{ width: "100%", maxWidth: "300px", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.9rem" }}
            />
          </div>

          {/* রসিদ */}
          <ReceiptContent
            payment={payment}
            student={student}
            preparedBy={preparedBy}
            paymentMethodLabel={paymentMethodLabel}
          />
        </div>
      </div>

      {/* প্রিন্টের জন্য গোপন কনটেইনার */}
      <div className="print-only" style={{ display: "none" }}>
        <ReceiptContent
          payment={payment}
          student={student}
          preparedBy={preparedBy}
          paymentMethodLabel={paymentMethodLabel}
        />
      </div>
    </>
  );
}

function ReceiptContent({
  payment,
  student,
  preparedBy,
  paymentMethodLabel,
}: {
  payment: Payment;
  student: Student;
  preparedBy: string;
  paymentMethodLabel: (m: string) => string;
}) {
  const amountWords = numberToBanglaWords(payment.amount);

  return (
    <div
      className="receipt-container"
      style={{
        border: "2px solid #0f766e",
        borderRadius: "8px",
        padding: "1.75rem 1.5rem",
        background: "#ffffff",
      }}
    >
      {/* হেডার */}
      <div style={{ textAlign: "center", borderBottom: "1px solid #0f766e", paddingBottom: "0.85rem", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "0.2rem", fontWeight: "700" }}>
          দারুল হিকমাহ মডেল মাদ্রাসা
        </h1>
        <p style={{ fontSize: "0.82rem", color: "#475569", marginBottom: "0.15rem" }}>
          ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
        </p>
        <p style={{ fontSize: "0.82rem", color: "#475569" }}>
          মোবাইল: ০১৯৭০-৫১৭৫৬৬
        </p>
      </div>

      {/* রসিদ শিরোনাম */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <span
          style={{
            display: "inline-block",
            padding: "0.3rem 1.25rem",
            background: "#0f766e",
            color: "#ffffff",
            borderRadius: "4px",
            fontSize: "0.95rem",
            fontWeight: "600",
            letterSpacing: "0.05rem",
          }}
        >
          বেতন রসিদ
        </span>
      </div>

      {/* রসিদ নম্বর ও তারিখ */}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.88rem" }}>
        <div>
          <strong>রসিদ নম্বর:</strong> {payment.receipt_no || "-"}
        </div>
        <div>
          <strong>তারিখ:</strong> {formatDateBangla(payment.payment_date)}
        </div>
      </div>

      {/* শিক্ষার্থীর তথ্য */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          padding: "0.85rem 1rem",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.6rem", fontSize: "0.85rem" }}>
          <div>
            <span style={{ color: "#64748b", fontSize: "0.78rem" }}>শিক্ষার্থীর নাম:</span>
            <div style={{ fontWeight: "600", color: "#1a1a1a" }}>{student.name}</div>
          </div>
          <div>
            <span style={{ color: "#64748b", fontSize: "0.78rem" }}>শ্রেণি:</span>
            <div style={{ fontWeight: "500" }}>
              {student.class_name}
              {student.section && ` — ${student.section}`}
            </div>
          </div>
          <div>
            <span style={{ color: "#64748b", fontSize: "0.78rem" }}>রোল:</span>
            <div style={{ fontWeight: "500" }}>{student.roll || "-"}</div>
          </div>
          <div>
            <span style={{ color: "#64748b", fontSize: "0.78rem" }}>আইডি:</span>
            <div style={{ fontWeight: "500" }}>{student.student_id || "-"}</div>
          </div>
          {student.guardian_name && (
            <div>
              <span style={{ color: "#64748b", fontSize: "0.78rem" }}>অভিভাবক:</span>
              <div style={{ fontWeight: "500" }}>{student.guardian_name}</div>
            </div>
          )}
        </div>
      </div>

      {/* পেমেন্টের বিবরণ */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1rem", fontSize: "0.88rem" }}>
        <thead>
          <tr style={{ background: "#0f766e", color: "#ffffff" }}>
            <th style={{ padding: "0.55rem 0.7rem", textAlign: "left", border: "1px solid #0f766e" }}>বিবরণ</th>
            <th style={{ padding: "0.55rem 0.7rem", textAlign: "left", border: "1px solid #0f766e" }}>মাস</th>
            <th style={{ padding: "0.55rem 0.7rem", textAlign: "left", border: "1px solid #0f766e" }}>পদ্ধতি</th>
            <th style={{ padding: "0.55rem 0.7rem", textAlign: "right", border: "1px solid #0f766e" }}>পরিমাণ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "0.7rem", border: "1px solid #cbd5e1" }}>মাসিক বেতন</td>
            <td style={{ padding: "0.7rem", border: "1px solid #cbd5e1" }}>
              {MONTHS[payment.month - 1]} {toBanglaDigits(payment.year)}
            </td>
            <td style={{ padding: "0.7rem", border: "1px solid #cbd5e1" }}>
              {paymentMethodLabel(payment.payment_method)}
            </td>
            <td style={{ padding: "0.7rem", border: "1px solid #cbd5e1", textAlign: "right", fontWeight: "600" }}>
              ৳ {toBanglaDigits(payment.amount)}
            </td>
          </tr>
          <tr style={{ background: "#f1f5f9" }}>
            <td colSpan={3} style={{ padding: "0.7rem", border: "1px solid #cbd5e1", textAlign: "right", fontWeight: "600" }}>
              সর্বমোট:
            </td>
            <td style={{ padding: "0.7rem", border: "1px solid #cbd5e1", textAlign: "right", fontWeight: "700", color: "#0f766e", fontSize: "1rem" }}>
              ৳ {toBanglaDigits(payment.amount)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* কথায় */}
      <div style={{ background: "#f0fdf4", border: "1px dashed #0f766e", padding: "0.65rem 0.85rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.88rem" }}>
        <strong style={{ color: "#0f766e" }}>কথায়:</strong>{" "}
        <span style={{ color: "#1a1a1a" }}>{amountWords}</span>
      </div>

      {/* নোট */}
      {payment.note && (
        <div style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "#475569" }}>
          <strong>নোট:</strong> {payment.note}
        </div>
      )}

      {/* স্বাক্ষর */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3rem", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center", minWidth: "150px" }}>
          <div style={{ borderTop: "1px solid #475569", paddingTop: "0.35rem", fontSize: "0.82rem", color: "#475569" }}>
            গ্রাহকের স্বাক্ষর
          </div>
        </div>
        <div style={{ textAlign: "center", minWidth: "150px" }}>
          <div style={{ borderTop: "1px solid #475569", paddingTop: "0.35rem", fontSize: "0.82rem", color: "#475569" }}>
            {preparedBy || "গ্রহণকারীর স্বাক্ষর"}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.72rem", color: "#94a3b8" }}>
        এই রসিদটি কম্পিউটার দ্বারা তৈরি — যাচাইয়ের জন্য মাদ্রাসা অফিসে যোগাযোগ করুন
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: "0.55rem 1.1rem",
  background: "#0f766e",
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  fontSize: "0.88rem",
  fontWeight: "500",
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "0.55rem 1.1rem",
  background: "#ffffff",
  color: "#475569",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "0.88rem",
  cursor: "pointer",
};
