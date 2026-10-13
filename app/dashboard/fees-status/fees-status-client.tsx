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

function todayBangla(): string {
  const d = new Date();
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

  const paidCount = rows.filter((r) => r.status === "paid").length;
  const partialCount = rows.filter((r) => r.status === "partial").length;
  const unpaidOnly = rows.filter((r) => r.status === "unpaid").length;
  const totalPayable = rows.reduce((s, r) => s + r.payable, 0);
  const totalPaid = rows.reduce((s, r) => s + r.paid, 0);
  const totalDue = rows.reduce((s, r) => s + r.due, 0);

  const statusText =
    statusFilter === "all" ? "All" :
    statusFilter === "paid" ? "Paid" :
    statusFilter === "unpaid" ? "Unpaid" : "Partial";

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

      <div className="no-print max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        {/* শিরোনাম */}
        <div className="mb-4">
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
            Paid / Unpaid তালিকা
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {MONTHS[month - 1]} {toBangla(year)}
          </p>
        </div>

        {/* সারাংশ — মোবাইলে ২x২ গ্রিড */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <SummaryCard label="মোট শিক্ষার্থী" value={toBangla(students.length)} color="#2563eb" />
          <SummaryCard label="Paid" value={toBangla(paidCount)} color="#15803d" />
          <SummaryCard label="Partial" value={toBangla(partialCount)} color="#b45309" />
          <SummaryCard label="Unpaid" value={toBangla(unpaidOnly)} color="#b91c1c" />
        </div>

        {/* টাকার সারাংশ */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <MoneyCard label="প্রাপ্য" value={totalPayable} color="#1e40af" />
          <MoneyCard label="আদায়" value={totalPaid} color="#15803d" />
          <MoneyCard label="বাকি" value={totalDue} color="#b91c1c" />
        </div>

        {/* ফিল্টার */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">মাস</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none">
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">বছর</label>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">শ্রেণি</label>
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none">
                <option value="">সব শ্রেণি</option>
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">স্ট্যাটাস</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none">
                <option value="all">সব</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">খুঁজুন</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম / আইডি / রোল" className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <input type="text" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} placeholder="প্রস্তুতকারীর নাম" className="flex-1 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none" />
            <button onClick={handlePrint} className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium shadow-md transition flex items-center gap-1.5 shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>

      {/* প্রিন্ট হেডার */}
      <div className="print-area max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-2xl px-4 py-4 mb-4 border-b-2 border-brand-600">
          <div className="text-center mb-3">
            <h1 className="text-lg font-bold text-brand-700 mb-0.5">
              দারুল হিকমাহ মডেল মাদ্রাসা
            </h1>
            <p className="text-xs text-slate-500">
              ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
            </p>
          </div>
          <div className="flex justify-between flex-wrap gap-2 text-xs mb-1">
            <div><strong>বিষয়:</strong> Paid / Unpaid তালিকা ({statusText})</div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div className="flex justify-between flex-wrap gap-2 text-xs">
            <div><strong>মাস:</strong> {MONTHS[month - 1]} {toBangla(year)}</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        {/* ============ মোবাইল: কার্ড ============ */}
        <div className="md:hidden space-y-2.5 mb-6">
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-sm">লোড হচ্ছে...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 text-sm">
              কোনো ফলাফল পাওয়া যায়নি
            </div>
          ) : (
            filtered.map((r, i) => {
              const sc =
                r.status === "paid"
                  ? { bg: "#f0fdf4", text: "#15803d", badge: "#dcfce7" }
                  : r.status === "unpaid"
                  ? { bg: "#fef2f2", text: "#b91c1c", badge: "#fee2e2" }
                  : { bg: "#fffbeb", text: "#b45309", badge: "#fef3c7" };

              return (
                <div
                  key={r.student.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
                  style={{ borderLeftWidth: "4px", borderLeftColor: sc.text }}
                >
                  {/* হেডার */}
                  <div className="px-4 py-3 flex items-start justify-between gap-3" style={{ background: sc.bg }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-slate-400">
                          {toBangla(i + 1)}.
                        </span>
                        <h3 className="text-[15px] font-semibold text-slate-900 truncate">
                          {r.student.name}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500">
                        <span className="font-medium">{r.student.class_name}</span>
                        {r.student.roll && <span>• রোল {r.student.roll}</span>}
                        {r.student.student_id && <span>• {r.student.student_id}</span>}
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                      style={{ background: sc.badge, color: sc.text }}
                    >
                      {r.status === "paid" ? "Paid" : r.status === "unpaid" ? "Unpaid" : "Partial"}
                    </span>
                  </div>

                  {/* টাকা */}
                  <div className="px-4 py-3 grid grid-cols-3 gap-2 border-b border-slate-100">
                    <div className="text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">প্রাপ্য</div>
                      <div className="text-[13px] font-bold text-slate-700">
                        ৳{toBangla(r.payable)}
                      </div>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <div className="text-[10px] text-slate-400 mb-0.5">জমা</div>
                      <div className="text-[13px] font-bold text-emerald-600">
                        ৳{toBangla(r.paid)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">বাকি</div>
                      <div className={`text-[13px] font-bold ${r.due > 0 ? "text-red-600" : "text-slate-400"}`}>
                        ৳{toBangla(r.due)}
                      </div>
                    </div>
                  </div>

                  {/* বাটন */}
                  <button
                    onClick={() => setDetailStudent(r.student)}
                    className="w-full py-2.5 text-[12px] font-medium text-brand-700 hover:bg-brand-50 transition flex items-center justify-center gap-1.5"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    বিস্তারিত দেখুন
                  </button>
                </div>
              );
            })
          )}

          {filtered.length > 0 && !loading && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 mt-2">
              <div className="text-[11px] opacity-80 mb-2 text-center">
                সর্বমোট — {toBangla(filtered.length)} জন
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] opacity-70">প্রাপ্য</div>
                  <div className="text-[13px] font-bold">৳{toBangla(totalPayable)}</div>
                </div>
                <div className="border-x border-white/20">
                  <div className="text-[10px] opacity-70">জমা</div>
                  <div className="text-[13px] font-bold text-emerald-300">৳{toBangla(totalPaid)}</div>
                </div>
                <div>
                  <div className="text-[10px] opacity-70">বাকি</div>
                  <div className="text-[13px] font-bold text-red-300">৳{toBangla(totalDue)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============ ডেস্কটপ: টেবিল ============ */}
        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500">লোড হচ্ছে...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">কোনো ফলাফল পাওয়া যায়নি</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">নং</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">নাম</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">শ্রেণি</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">রোল</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs">প্রাপ্য</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs">জমা</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs">বাকি</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 text-xs">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 text-xs no-print">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const badge =
                      r.status === "paid" ? { bg: "#dcfce7", text: "#15803d" }
                      : r.status === "unpaid" ? { bg: "#fee2e2", text: "#b91c1c" }
                      : { bg: "#fef3c7", text: "#b45309" };

                    return (
                      <tr key={r.student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3 text-slate-500 text-xs">{toBangla(i + 1)}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          {r.student.name}
                          {r.student.student_id && (
                            <div className="text-xs text-slate-400">আইডি: {r.student.student_id}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {r.student.class_name}
                          {r.student.section && ` (${r.student.section})`}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.student.roll || "-"}</td>
                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">৳{toBangla(r.payable)}</td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-700">৳{toBangla(r.paid)}</td>
                        <td className={`px-4 py-3 text-right font-medium ${r.due > 0 ? "text-red-700" : "text-slate-400"}`}>
                          ৳{toBangla(r.due)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: badge.bg, color: badge.text }}>
                            {r.status === "paid" ? "Paid" : r.status === "unpaid" ? "Unpaid" : "Partial"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center no-print">
                          <button onClick={() => setDetailStudent(r.student)} className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100 transition">
                            বিস্তারিত
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-t-2 border-brand-600">
                    <td colSpan={4} className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                      সর্বমোট ({toBangla(filtered.length)} জন):
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">৳{toBangla(totalPayable)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">৳{toBangla(totalPaid)}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-700">৳{toBangla(totalDue)}</td>
                    <td colSpan={2}></td>
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

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-sm" style={{ borderLeftWidth: "3px", borderLeftColor: color }}>
      <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">{label}</div>
      <div className="text-base font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function MoneyCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-sm" style={{ borderLeftWidth: "3px", borderLeftColor: color }}>
      <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">{label}</div>
      <div className="text-[13px] font-bold" style={{ color }}>৳{toBangla(value)}</div>
    </div>
  );
}
