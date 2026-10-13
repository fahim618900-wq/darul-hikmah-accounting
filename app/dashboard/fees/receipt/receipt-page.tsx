"use client";

import { useState } from "react";
import Link from "next/link";
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
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

export default function ReceiptPage({
  payment,
  student,
  userName,
}: {
  payment: Payment;
  student: Student;
  userName: string;
}) {
  const [preparedBy, setPreparedBy] = useState(userName);

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

  const amountWords = numberToBanglaWords(payment.amount);

  return (
    <>
      {/* কন্ট্রোল (প্রিন্টে আসবে না) */}
      <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto", padding: "1.5rem 1rem 0" }}>
        <Link
          href="/dashboard/fees"
          style={{ display: "inline-block", color: "#0f766e", fontSize: "0.9rem", marginBottom: "1rem", textDecoration: "none" }}
        >
          ← বেতন আদায় পেজে ফিরে যান
        </Link>

        <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: "0.3rem", fontWeight: "500" }}>
              প্রস্তুতকারীর নাম
            </label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.9rem" }}
            />
          </div>
          <button
            onClick={handlePrint}
            style={{ padding: "0.6rem 1.25rem", background: "#0f766e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.9rem", fontWeight: "500", cursor: "pointer" }}
          >
            🖨️ Print / PDF
          </button>
        </div>
      </div>

      {/* রসিদ */}
      <div className="print-area" style={{ maxWidth: "210mm", margin: "0 auto", padding: "0 1rem 2rem" }}>
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

          {/* শিরোনাম */}
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <span style={{ display: "inline-block", padding: "0.3rem 1.25rem", background: "#0f766e", color: "#ffffff", borderRadius: "4px", fontSize: "0.95rem", fontWeight: "600", letterSpacing: "0.05rem" }}>
              বেতন রসিদ
            </span>
          </div>

          {/* রসিদ নম্বর ও তারিখ */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.88rem" }}>
            <div><strong>রসিদ নম্বর:</strong> {payment.receipt_no || "-"}</div>
            <div><strong>তারিখ:</strong> {formatDateBangla(payment.payment_date)}</div>
          </div>

          {/* শিক্ষার্থীর তথ্য */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "0.85rem 1rem", marginBottom: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.6rem", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.78rem" }}>শিক্ষার্থীর নাম:</span>
                <div style={{ fontWeight: "600" }}>{student.name}</div>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.78rem" }}>শ্রেণি:</span>
                <div style={{ fontWeight: "500" }}>{student.class_name}{student.section && ` — ${student.section}`}</div>
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

          {/* পেমেন্ট টেবিল */}
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
            <span>{amountWords}</span>
          </div>

          {payment.note && (
            <div style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
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
      </div>
    </>
  );
}
