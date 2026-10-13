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
  created_at: string;
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
  address: string | null;
  monthly_fee: number;
  discount: number;
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
  const payable = Number(student.monthly_fee) - Number(student.discount || 0);
  const paymentDate = new Date(payment.payment_date);
  const dayName = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"][paymentDate.getDay()];

  return (
    <>
      {/* কন্ট্রোল (প্রিন্টে আসবে না) */}
      <div className="no-print max-w-2xl mx-auto px-4 pt-5">
        <Link
          href="/dashboard/fees-status"
          className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-medium mb-4 hover:gap-3 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          তালিকায় ফিরে যান
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                গ্রহণকারীর নাম (রসিদে দেখাবে)
              </label>
              <input
                type="text"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            <button
              onClick={handlePrint}
              className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/25 transition flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / PDF
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            প্রিন্ট সেটিংসে কাগজের সাইজ <strong>A5</strong> নির্বাচন করুন
          </p>
        </div>
      </div>

      {/* ============ A5 রসিদ ============ */}
      <div className="print-area receipt-wrapper">
        <div className="receipt-a5">
          {/* উপরের ডেকোরেটিভ বার */}
          <div className="receipt-top-bar">
            <div className="bar-segment bar-brand" />
            <div className="bar-segment bar-emerald" />
            <div className="bar-segment bar-amber" />
          </div>

          {/* হেডার */}
          <div className="receipt-header">
            <div className="receipt-logo">
              <div className="logo-circle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
            </div>
            <div className="receipt-header-text">
              <h1 className="receipt-title">দারুল হিকমাহ মডেল মাদ্রাসা</h1>
              <p className="receipt-subtitle">ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ</p>
              <p className="receipt-contact">মোবাইল: ০১৯৭০-৫১৭৫৬৬ | ইমেইল: darulhikmahphulpur2025@gmail.com</p>
            </div>
          </div>

          {/* রসিদ ব্যাজ */}
          <div className="receipt-badge-row">
            <div className="badge badge-emerald">✓ পরিশোধিত</div>
            <div className="badge badge-outline">বেতন রসিদ</div>
          </div>

          {/* রসিদ নম্বর ও তারিখ */}
          <div className="receipt-meta">
            <div className="meta-box">
              <div className="meta-label">রসিদ নম্বর</div>
              <div className="meta-value mono">{payment.receipt_no || "-"}</div>
            </div>
            <div className="meta-box">
              <div className="meta-label">তারিখ</div>
              <div className="meta-value">{formatDateBangla(payment.payment_date)}</div>
              <div className="meta-sub">{dayName}</div>
            </div>
            <div className="meta-box">
              <div className="meta-label">মাস</div>
              <div className="meta-value">{MONTHS[payment.month - 1]} {toBanglaDigits(payment.year)}</div>
            </div>
          </div>

          {/* শিক্ষার্থীর তথ্য */}
          <div className="receipt-section">
            <h3 className="section-title">
              <span className="section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              শিক্ষার্থীর তথ্য
            </h3>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">নাম</span>
                <span className="info-value bold">{student.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">শ্রেণি</span>
                <span className="info-value">{student.class_name}{student.section ? ` (${student.section})` : ""}</span>
              </div>
              <div className="info-row">
                <span className="info-label">রোল</span>
                <span className="info-value">{student.roll || "-"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">আইডি</span>
                <span className="info-value">{student.student_id || "-"}</span>
              </div>
              {student.guardian_name && (
                <div className="info-row">
                  <span className="info-label">অভিভাবক</span>
                  <span className="info-value">{student.guardian_name}</span>
                </div>
              )}
              {student.guardian_phone && (
                <div className="info-row">
                  <span className="info-label">মোবাইল</span>
                  <span className="info-value">{student.guardian_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* পেমেন্ট টেবিল */}
          <div className="receipt-section">
            <h3 className="section-title">
              <span className="section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </span>
              পেমেন্টের বিবরণ
            </h3>
            <table className="payment-table">
              <thead>
                <tr>
                  <th>বিবরণ</th>
                  <th>পদ্ধতি</th>
                  <th className="text-right">পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="cell-title">মাসিক বেতন</div>
                    <div className="cell-sub">{MONTHS[payment.month - 1]} {toBanglaDigits(payment.year)}</div>
                  </td>
                  <td>
                    <span className="method-badge">{paymentMethodLabel(payment.payment_method)}</span>
                  </td>
                  <td className="text-right bold">৳ {toBanglaDigits(payment.amount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="text-right">সর্বমোট</td>
                  <td className="text-right total-amount">৳ {toBanglaDigits(payment.amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* কথায় */}
          <div className="amount-words">
            <div className="amount-words-label">কথায়</div>
            <div className="amount-words-value">{amountWords}</div>
          </div>

          {/* নোট */}
          {payment.note && (
            <div className="receipt-section">
              <div className="note-box">
                <strong>নোট:</strong> {payment.note}
              </div>
            </div>
          )}

          {/* স্বাক্ষর */}
          <div className="signature-row">
            <div className="signature-box">
              <div className="signature-line" />
              <div className="signature-label">গ্রাহকের স্বাক্ষর</div>
            </div>
            <div className="signature-box">
              <div className="signature-line" />
              <div className="signature-label">{preparedBy || "গ্রহণকারীর স্বাক্ষর"}</div>
            </div>
          </div>

          {/* ফুটার */}
          <div className="receipt-footer">
            <div className="footer-note">
              এই রসিদটি কম্পিউটার দ্বারা স্বয়ংক্রিয়ভাবে তৈরি — যাচাইয়ের জন্য মাদ্রাসা অফিসে যোগাযোগ করুন
            </div>
            <div className="footer-brand">
              দারুল হিকমাহ — আধুনিক শিক্ষা ও ইসলামী মূল্যবোধের সমন্বয়
            </div>
          </div>
        </div>
      </div>

      {/* ============ স্টাইল ============ */}
      <style jsx>{`
        .receipt-wrapper {
          max-width: 148mm;
          margin: 0 auto 2rem;
          padding: 0 12px;
        }

        .receipt-a5 {
          background: #ffffff;
          width: 100%;
          min-height: 210mm;
          padding: 12mm 10mm;
          box-sizing: border-box;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: "Noto Sans Bengali", "Inter", system-ui, sans-serif;
          color: #0f172a;
          position: relative;
        }

        /* ডেকোরেটিভ বার */
        .receipt-top-bar {
          display: flex;
          height: 6px;
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 14px;
        }
        .bar-segment { flex: 1; }
        .bar-brand { background: #0f766e; }
        .bar-emerald { background: #10b981; }
        .bar-amber { background: #f59e0b; }

        /* হেডার */
        .receipt-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1.5px solid #0f766e;
          margin-bottom: 12px;
        }
        .receipt-logo { flex-shrink: 0; }
        .logo-circle {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0f766e, #14b8a6);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);
        }
        .receipt-header-text { flex: 1; min-width: 0; }
        .receipt-title {
          font-size: 17px;
          font-weight: 700;
          color: #0f766e;
          margin: 0 0 2px 0;
          letter-spacing: -0.2px;
        }
        .receipt-subtitle {
          font-size: 10px;
          color: #475569;
          margin: 0 0 1px 0;
        }
        .receipt-contact {
          font-size: 9px;
          color: #64748b;
          margin: 0;
        }

        /* ব্যাজ */
        .receipt-badge-row {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 600;
        }
        .badge-emerald {
          background: #d1fae5;
          color: #065f46;
        }
        .badge-outline {
          background: transparent;
          color: #0f766e;
          border: 1px solid #0f766e;
        }

        /* মেটা */
        .receipt-meta {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }
        .meta-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 6px 8px;
          border-left: 3px solid #0f766e;
        }
        .meta-label {
          font-size: 8.5px;
          color: #64748b;
          margin-bottom: 1px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .meta-value {
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
        }
        .meta-value.mono {
          font-family: ui-monospace, "Courier New", monospace;
          color: #0f766e;
          letter-spacing: -0.3px;
          word-break: break-all;
        }
        .meta-sub {
          font-size: 8.5px;
          color: #94a3b8;
          margin-top: 1px;
        }

        /* সেকশন */
        .receipt-section {
          margin-bottom: 10px;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 700;
          color: #0f766e;
          margin: 0 0 6px 0;
          padding-bottom: 4px;
          border-bottom: 1px dashed #cbd5e1;
        }
        .section-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 4px;
          background: #ccfbf1;
          color: #0f766e;
        }

        /* ইনফো গ্রিড */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 12px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 6px;
          padding: 3px 0;
          border-bottom: 1px dotted #e2e8f0;
          font-size: 10px;
        }
        .info-label {
          color: #64748b;
          flex-shrink: 0;
        }
        .info-value {
          color: #0f172a;
          text-align: right;
          word-break: break-word;
        }
        .info-value.bold {
          font-weight: 700;
          font-size: 11px;
        }

        /* পেমেন্ট টেবিল */
        .payment-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        .payment-table th {
          background: #0f766e;
          color: #ffffff;
          padding: 6px 8px;
          text-align: left;
          font-size: 9.5px;
          font-weight: 600;
        }
        .payment-table th:first-child { border-top-left-radius: 6px; }
        .payment-table th:last-child { border-top-right-radius: 6px; }
        .payment-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .cell-title {
          font-weight: 600;
          color: #0f172a;
          font-size: 10.5px;
        }
        .cell-sub {
          font-size: 9px;
          color: #64748b;
          margin-top: 1px;
        }
        .method-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #475569;
          font-size: 9px;
          font-weight: 500;
        }
        .payment-table .bold { font-weight: 700; color: #0f172a; }
        .payment-table tfoot td {
          background: #f0fdfa;
          border-top: 1.5px solid #0f766e;
          font-weight: 600;
          padding: 7px 8px;
        }
        .total-amount {
          color: #0f766e;
          font-size: 13px;
          font-weight: 800;
        }
        .text-right { text-align: right; }

        /* কথায় */
        .amount-words {
          background: #f0fdfa;
          border: 1px dashed #0f766e;
          border-radius: 6px;
          padding: 7px 10px;
          margin-bottom: 10px;
        }
        .amount-words-label {
          font-size: 8.5px;
          color: #0f766e;
          font-weight: 600;
          margin-bottom: 1px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .amount-words-value {
          font-size: 11px;
          color: #0f172a;
          font-weight: 600;
        }

        /* নোট */
        .note-box {
          background: #fffbeb;
          border-left: 3px solid #f59e0b;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 10px;
          color: #78350f;
        }

        /* স্বাক্ষর */
        .signature-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 22px;
          margin-bottom: 14px;
        }
        .signature-box {
          text-align: center;
        }
        .signature-line {
          border-top: 1px solid #475569;
          margin-bottom: 4px;
        }
        .signature-label {
          font-size: 9px;
          color: #475569;
          font-weight: 500;
        }

        /* ফুটার */
        .receipt-footer {
          text-align: center;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
        }
        .footer-note {
          font-size: 8px;
          color: #94a3b8;
          margin-bottom: 2px;
        }
        .footer-brand {
          font-size: 8.5px;
          color: #0f766e;
          font-weight: 600;
          letter-spacing: 0.2px;
        }

        /* ============ প্রিন্ট ============ */
        @media print {
          @page {
            size: A5 portrait;
            margin: 0;
          }
          .receipt-wrapper {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .receipt-a5 {
            width: 148mm !important;
            min-height: 210mm !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 12mm 10mm !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </>
  );
}
