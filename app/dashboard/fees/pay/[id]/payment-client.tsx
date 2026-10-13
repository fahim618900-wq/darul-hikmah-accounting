"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: number;
  name: string;
  student_id: string | null;
  class_name: string;
  section: string | null;
  roll: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  monthly_fee: number;
  discount: number;
};

type ExistingPayment = {
  amount: number;
  month: number;
  year: number;
  payment_date: string;
  receipt_no: string | null;
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

export default function PaymentClient({
  student,
  currentMonth,
  currentYear,
  paidThisMonth,
  existingPayments,
}: {
  student: Student;
  currentMonth: number;
  currentYear: number;
  paidThisMonth: number;
  existingPayments: ExistingPayment[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const payable = Number(student.monthly_fee) - Number(student.discount || 0);
  const remaining = Math.max(0, payable - paidThisMonth);

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [amount, setAmount] = useState(String(remaining));
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ receiptNo: string; amount: number; month: number; year: number } | null>(null);

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const receiptNo = `R-${year}${String(month).padStart(2, "0")}-${Date.now().toString().slice(-6)}`;

    const { error: err } = await supabase.from("fee_payments").insert({
      student_id: student.id,
      month,
      year,
      amount: Number(amount),
      payment_method: paymentMethod,
      receipt_no: receiptNo,
      note,
    });

    if (err) {
      setError("সমস্যা: " + err.message);
      setLoading(false);
      return;
    }

    setSuccessData({
      receiptNo,
      amount: Number(amount),
      month,
      year,
    });
    setShowSuccess(true);
    setLoading(false);
    router.refresh();
  }

  if (showSuccess && successData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
            সফল হয়েছে!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            বেতন সফলভাবে জমা হয়েছে
          </p>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 text-left">
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 text-sm">শিক্ষার্থী</span>
              <span className="font-semibold text-slate-900 dark:text-white text-sm">{student.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 text-sm">মাস</span>
              <span className="font-semibold text-slate-900 dark:text-white text-sm">
                {MONTHS[successData.month - 1]} {toBangla(successData.year)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 text-sm">পরিমাণ</span>
              <span className="font-bold text-emerald-600 text-base">
                ৳{toBangla(successData.amount)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 text-sm">রসিদ নম্বর</span>
              <span className="font-semibold text-slate-900 dark:text-white text-xs">
                {successData.receiptNo}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href={`/dashboard/fees/receipt?id=${successData.receiptNo}`}
              className="block w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition"
            >
              রসিদ দেখুন / প্রিন্ট করুন
            </Link>
            <Link
              href="/dashboard/fees"
              className="block w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition"
            >
              আরেকজনের বেতন নিন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 pb-6">
      {/* ফিরে যাওয়ার বাটন */}
      <Link
        href="/dashboard/fees"
        className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-medium mb-4 hover:gap-3 transition-all"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        তালিকায় ফিরে যান
      </Link>

      {/* শিরোনাম */}
      <div className="text-center mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          বেতন আদায়
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          নিচের তথ্য যাচাই করে বেতন জমা করুন
        </p>
      </div>

      {/* শিক্ষার্থীর তথ্য কার্ড */}
      <div className="bg-gradient-to-br from-brand-600 to-purple-600 rounded-3xl p-5 mb-4 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] opacity-80 mb-1">শিক্ষার্থীর নাম</div>
            <h2 className="text-xl font-bold truncate">{student.name}</h2>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs opacity-90 mt-2">
              <span>{student.class_name}</span>
              {student.section && <span>• {student.section}</span>}
              {student.roll && <span>• রোল {student.roll}</span>}
              {student.student_id && <span>• আইডি {student.student_id}</span>}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        {student.guardian_name && (
          <div className="text-xs opacity-85 pt-3 border-t border-white/20">
            অভিভাবক: {student.guardian_name}
            {student.guardian_phone && ` (${student.guardian_phone})`}
          </div>
        )}
      </div>

      {/* মাসিক হিসাব কার্ড */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          {MONTHS[currentMonth - 1]} {toBangla(currentYear)} মাসের হিসাব
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 mb-1">প্রাপ্য</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              ৳{toBangla(payable)}
            </div>
          </div>
          <div className="text-center border-x border-slate-100 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 mb-1">জমা হয়েছে</div>
            <div className="text-base font-bold text-emerald-600">
              ৳{toBangla(paidThisMonth)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-500 mb-1">বাকি</div>
            <div className={`text-base font-bold ${remaining > 0 ? "text-red-600" : "text-slate-400"}`}>
              ৳{toBangla(remaining)}
            </div>
          </div>
        </div>

        {existingPayments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 mb-2">এই মাসের পূর্বের পেমেন্ট:</div>
            <div className="space-y-1.5">
              {existingPayments.map((p, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-slate-500">{p.payment_date}</span>
                  <span className="font-semibold text-emerald-600">৳{toBangla(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* সফল/এরর মেসেজ */}
      {message && (
        <div className="mb-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* পেমেন্ট ফর্ম */}
      <form onSubmit={handlePayment} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          পেমেন্ট তথ্য
        </h3>

        {/* মাস ও বছর */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              কোন মাসের বেতন?
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">বছর</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        </div>

        {/* পরিমাণ */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            কত টাকা জমা নিচ্ছেন? *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-semibold">৳</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min={1}
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <button
              type="button"
              onClick={() => setAmount(String(payable))}
              className="px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-medium hover:bg-brand-100 transition"
            >
              সম্পূর্ণ {toBangla(payable)} ৳
            </button>
            {remaining < payable && remaining > 0 && (
              <button
                type="button"
                onClick={() => setAmount(String(remaining))}
                className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium hover:bg-amber-100 transition"
              >
                বাকি {toBangla(remaining)} ৳
              </button>
            )}
            <button
              type="button"
              onClick={() => setAmount(String(Math.floor(payable / 2)))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-200 transition"
            >
              অর্ধেক
            </button>
          </div>
        </div>

        {/* পেমেন্ট পদ্ধতি */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            কীভাবে টাকা দিচ্ছেন?
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { value: "cash", label: "নগদ" },
              { value: "bkash", label: "বিকাশ" },
              { value: "nagad", label: "নগদ (Nagad)" },
              { value: "bank", label: "ব্যাংক" },
              { value: "other", label: "অন্যান্য" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPaymentMethod(opt.value)}
                className={`px-2 py-2.5 rounded-xl text-xs font-medium transition border-2 ${
                  paymentMethod === opt.value
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* নোট */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            নোট (ঐচ্ছিক)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="যেমন: বাকি পরে দেবে"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        {/* সাবমিট */}
        <button
          type="submit"
          disabled={loading || !amount || Number(amount) <= 0}
          className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold shadow-md shadow-brand-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              সংরক্ষণ হচ্ছে...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              ৳{toBangla(amount || 0)} জমা নিন
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-400 text-center mt-3">
          সাবমিট করলে স্বয়ংক্রিয়ভাবে রসিদ তৈরি হবে
        </p>
      </form>
    </div>
  );
}
