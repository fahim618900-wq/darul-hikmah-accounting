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
  monthly_fee: number;
  discount: number;
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

export default function FeesClient({ students }: { students: Student[] }) {
  const router = useRouter();
  const supabase = createClient();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [classFilter, setClassFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(true);

  const classes = Array.from(new Set(students.map((s) => s.class_name)));

  const filteredStudents = students.filter((s) => {
    if (classFilter && s.class_name !== classFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.student_id || "").toLowerCase().includes(q) ||
        (s.roll || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  function handleSelectStudent(s: Student) {
    setSelectedStudent(s);
    setAmount(String(Number(s.monthly_fee) - Number(s.discount || 0)));
    setMessage("");
    setError("");
    setShowList(false);
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;

    setLoading(true);
    setMessage("");
    setError("");

    const receiptNo = `R-${year}${String(month).padStart(2, "0")}-${Date.now().toString().slice(-6)}`;

    const { error } = await supabase.from("fee_payments").insert({
      student_id: selectedStudent.id,
      month,
      year,
      amount: Number(amount),
      payment_method: paymentMethod,
      receipt_no: receiptNo,
      note,
    });

    if (error) {
      setError("সমস্যা: " + error.message);
      setLoading(false);
      return;
    }

    setMessage(`সফল! রসিদ নম্বর: ${receiptNo}`);
    setAmount("");
    setNote("");
    setSelectedStudent(null);
    setShowList(true);
    setLoading(false);
    router.refresh();
  }

  const payable = selectedStudent
    ? Number(selectedStudent.monthly_fee) - Number(selectedStudent.discount || 0)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 pb-4">
      {/* শিরোনাম */}
      <div className="mb-4">
        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
          বেতন আদায়
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          শিক্ষার্থী নির্বাচন করে মাসভিত্তিক বেতন আদায় করুন
        </p>
      </div>

      {/* মাস ও বছর নির্বাচন */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-3 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">মাস</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">বছর</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* সফল/এরর মেসেজ */}
      {message && (
        <div className="mb-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="mb-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ============ যদি শিক্ষার্থী সিলেক্ট না করা থাকে ============ */}
      {showList || !selectedStudent ? (
        <>
          {/* ফিল্টার */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-3 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="mb-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম, আইডি বা রোল দিয়ে খুঁজুন..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">সব শ্রেণি</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="mb-2 text-xs text-slate-500 dark:text-slate-400 text-center">
            {toBangla(filteredStudents.length)} জন শিক্ষার্থী — যার বেতন নিতে চান, তার নামে ট্যাপ করুন
          </div>

          {/* ============ মোবাইল: কার্ড ============ */}
          <div className="md:hidden space-y-2 mb-4">
            {filteredStudents.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500 text-sm border border-slate-200 dark:border-slate-800">
                কোনো শিক্ষার্থী নেই
              </div>
            ) : (
              filteredStudents.map((s) => {
                const payableAmt = Number(s.monthly_fee) - Number(s.discount || 0);
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStudent(s)}
                    className="w-full bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:border-brand-400 hover:shadow-md transition active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white truncate mb-1">
                          {s.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500">
                          <span className="font-medium">{s.class_name}</span>
                          {s.section && <span>• {s.section}</span>}
                          {s.roll && <span>• রোল {s.roll}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400 mb-0.5">মাসিক বেতন</div>
                        <div className="text-[15px] font-bold text-brand-600">
                          ৳{toBangla(payableAmt)}
                        </div>
                      </div>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* ============ ডেস্কটপ: টেবিল ============ */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-slate-500">কোনো শিক্ষার্থী নেই</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">আইডি</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">নাম</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">শ্রেণি</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">রোল</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs">মাসিক বেতন</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 text-xs">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => {
                      const payableAmt = Number(s.monthly_fee) - Number(s.discount || 0);
                      return (
                        <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="px-4 py-3 text-slate-500 text-xs">{s.student_id || "-"}</td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{s.name}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {s.class_name}
                            {s.section && ` (${s.section})`}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.roll || "-"}</td>
                          <td className="px-4 py-3 text-right font-bold text-brand-600">
                            ৳{toBangla(payableAmt)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleSelectStudent(s)}
                              className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition"
                            >
                              নির্বাচন করুন
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ============ শিক্ষার্থী সিলেক্ট করা হয়েছে — পেমেন্ট ফর্ম ============ */
        <div className="max-w-xl mx-auto">
          {/* শিক্ষার্থীর তথ্য কার্ড */}
          <div className="bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl p-4 mb-3 text-white shadow-lg">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] opacity-80 mb-0.5">শিক্ষার্থী</div>
                <h3 className="text-lg font-bold truncate">{selectedStudent.name}</h3>
                <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[11px] opacity-90 mt-1">
                  <span>{selectedStudent.class_name}</span>
                  {selectedStudent.section && <span>• {selectedStudent.section}</span>}
                  {selectedStudent.roll && <span>• রোল {selectedStudent.roll}</span>}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setShowList(true);
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center shrink-0 transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/20">
              <div>
                <div className="text-[10px] opacity-80 mb-0.5">মাসিক বেতন</div>
                <div className="text-base font-bold">৳{toBangla(selectedStudent.monthly_fee)}</div>
              </div>
              <div>
                <div className="text-[10px] opacity-80 mb-0.5">প্রদেয়</div>
                <div className="text-base font-bold">৳{toBangla(payable)}</div>
              </div>
            </div>
          </div>

          {/* পেমেন্ট ফর্ম */}
          <form onSubmit={handlePayment} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              পেমেন্ট তথ্য
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">মাস</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">বছর</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">পরিমাণ (৳) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min={1}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <button type="button" onClick={() => setAmount(String(payable))} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  সম্পূর্ণ ({toBangla(payable)})
                </button>
                <button type="button" onClick={() => setAmount(String(Math.floor(payable / 2)))} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  অর্ধেক
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">পেমেন্ট পদ্ধতি</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="cash">নগদ</option>
                <option value="bkash">বিকাশ</option>
                <option value="nagad">নগদ (Nagad)</option>
                <option value="bank">ব্যাংক</option>
                <option value="other">অন্যান্য</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">নোট (ঐচ্ছিক)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[15px] font-semibold shadow-md shadow-brand-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {loading ? "সংরক্ষণ হচ্ছে..." : "বেতন আদায় করুন"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
