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

function statusLabel(s: "paid" | "unpaid" | "partial"): string {
  return s === "paid" ? "Paid" : s === "unpaid" ? "Unpaid" : "Partial";
}

function statusColor(s: "paid" | "unpaid" | "partial"): { bg: string; text: string; border: string } {
  if (s === "paid") return { bg: "#dcfce7", text: "#15803d", border: "#86efac" };
  if (s === "unpaid") return { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" };
  return { bg: "#fef3c7", text: "#b45309", border: "#fcd34d" };
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

      {/* ==================== ফিল্টার ও সামারি ==================== */}
      <div className="no-print max-w-7xl mx-auto px-3 sm:px-4 pt-5">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Paid / Unpaid তালিকা
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {MONTHS[month - 1]} {toBangla(year)} — মাসভিত্তিক বেতন অবস্থা
          </p>
        </div>

        {/* সারাংশ কার্ড */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
          <SummaryCard label="মোট শিক্ষার্থী" value={toBangla(students.length)} suffix="জন" color="#2563eb" />
          <SummaryCard label="Paid" value={toBangla(paidCount)} suffix="জন" color="#15803d" />
          <SummaryCard label="Partial" value={toBangla(partialCount)} suffix="জন" color="#b45309" />
          <SummaryCard label="Unpaid" value={toBangla(unpaidOnly)} suffix="জন" color="#b91c1c" />
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <MoneyCard label="মোট প্রাপ্য" value={totalPayable} color="#1e40af" />
          <MoneyCard label="মোট আদায়" value={totalPaid} color="#15803d" />
          <MoneyCard label="মোট বাকি" value={totalDue} color="#b91c1c" />
        </div>

        {/* ফিল্টার */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">মাস</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">বছর</label>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            </div>
            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">শ্রেণি</label>
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                <option value="">সব</option>
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">স্ট্যাটাস</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">খুঁজুন</label>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম / আইডি / রোল" className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">প্রস্তুতকারীর নাম</label>
              <input type="text" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            </div>
            <button
              onClick={handlePrint}
              className="self-end px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium shadow-md shadow-brand-500/25 transition flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / PDF
            </button>
          </div>
        </div>
      </div>

      {/* ==================== প্রিন্ট হেডার ==================== */}
      <div className="print-area max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-2xl px-4 sm:px-6 py-4 sm:py-5 mb-4 border-b-2 border-brand-600">
          <div className="text-center mb-3">
            <h1 className="text-lg sm:text-xl font-bold text-brand-700 mb-1">
              দারুল হিকমাহ মডেল মাদ্রাসা
            </h1>
            <p className="text-xs text-slate-500">
              ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
            </p>
          </div>
          <div className="flex justify-between flex-wrap gap-2 text-xs sm:text-sm mb-1">
            <div><strong>বিষয়:</strong> Paid / Unpaid তালিকা ({statusText})</div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div className="flex justify-between flex-wrap gap-2 text-xs sm:text-sm">
            <div><strong>মাস:</strong> {MONTHS[month - 1]} {toBangla(year)}</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        {/* ==================== Excel-এর মতো টেবিল (মোবাইল ও ডেস্কটপ উভয়ে) ==================== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500">লোড হচ্ছে...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">কোনো ফলাফল পাওয়া যায়নি</div>
          ) : (
            <div className="overflow-x-auto excel-scroll">
              <table className="w-full border-collapse excel-table" style={{ minWidth: "700px" }}>
                <thead className="excel-head">
                  <tr>
                    <th className="excel-th excel-th-num">নং</th>
                    <th className="excel-th excel-th-name">নাম</th>
                    <th className="excel-th">শ্রেণি</th>
                    <th className="excel-th">রোল</th>
                    <th className="excel-th excel-th-money">প্রাপ্য</th>
                    <th className="excel-th excel-th-money">জমা</th>
                    <th className="excel-th excel-th-money">বাকি</th>
                    <th className="excel-th excel-th-status">স্ট্যাটাস</th>
                    <th className="excel-th no-print">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const sc = statusColor(r.status);
                    return (
                      <tr key={r.student.id} className="excel-tr">
                        <td className="excel-td excel-td-num">{toBangla(i + 1)}</td>
                        <td className="excel-td excel-td-name">
                          <div className="font-medium text-slate-900 dark:text-white">{r.student.name}</div>
                          {r.student.student_id && (
                            <div className="text-[10px] text-slate-400">আইডি: {r.student.student_id}</div>
                          )}
                        </td>
                        <td className="excel-td">
                          {r.student.class_name}
                          {r.student.section && <span className="text-slate-400"> ({r.student.section})</span>}
                        </td>
                        <td className="excel-td">{r.student.roll || "-"}</td>
                        <td className="excel-td excel-td-money">৳{toBangla(r.payable)}</td>
                        <td className="excel-td excel-td-money text-emerald-700 font-medium">৳{toBangla(r.paid)}</td>
                        <td className={`excel-td excel-td-money ${r.due > 0 ? "text-red-700 font-semibold" : "text-slate-400"}`}>
                          ৳{toBangla(r.due)}
                        </td>
                        <td className="excel-td excel-td-status">
                          <span
                            className="excel-badge"
                            style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}
                          >
                            {statusLabel(r.status)}
                          </span>
                        </td>
                        <td className="excel-td no-print text-center">
                          <button
                            onClick={() => setDetailStudent(r.student)}
                            className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-[11px] font-medium hover:bg-brand-100 dark:hover:bg-brand-900/50 transition"
                          >
                            বিস্তারিত
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="excel-tfoot">
                    <td colSpan={4} className="excel-td text-right font-semibold">
                      সর্বমোট ({toBangla(filtered.length)} জন):
                    </td>
                    <td className="excel-td excel-td-money font-bold">৳{toBangla(totalPayable)}</td>
                    <td className="excel-td excel-td-money font-bold text-emerald-700">৳{toBangla(totalPaid)}</td>
                    <td className="excel-td excel-td-money font-bold text-red-700">৳{toBangla(totalDue)}</td>
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

function SummaryCard({ label, value, suffix, color }: { label: string; value: string; suffix: string; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 shadow-sm" style={{ borderLeftWidth: "3px", borderLeftColor: color }}>
      <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      <div className="text-base sm:text-lg font-bold" style={{ color }}>
        {value}
        <span className="text-[10px] sm:text-xs font-normal text-slate-500 ml-1">{suffix}</span>
      </div>
    </div>
  );
}

function MoneyCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 shadow-sm" style={{ borderLeftWidth: "3px", borderLeftColor: color }}>
      <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mb-1 truncate">{label}</div>
      <div className="text-sm sm:text-base font-bold" style={{ color }}>
        ৳{toBangla(value)}
      </div>
    </div>
  );
}
