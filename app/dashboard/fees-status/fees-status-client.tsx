"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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

function todayBangla(): string {
  const d = new Date();
  return `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())}`;
}

function firstOfMonthISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function lastOfMonthISO(): string {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return last.toISOString().split("T")[0];
}

function statusLabel(s: "paid" | "unpaid" | "partial"): string {
  return s === "paid" ? "Paid" : s === "unpaid" ? "Unpaid" : "Partial";
}

function statusColor(s: "paid" | "unpaid" | "partial") {
  if (s === "paid") return { bg: "#dcfce7", text: "#15803d", border: "#86efac" };
  if (s === "unpaid") return { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" };
  return { bg: "#fef3c7", text: "#b45309", border: "#fcd34d" };
}

type FilterMode = "month" | "range";

export default function FeesStatusClient({
  students,
  userName,
  highlight = "",
  initialMonth,
  initialYear,
}: {
  students: Student[];
  userName: string;
  highlight?: string;
  initialMonth?: number;
  initialYear?: number;
}) {
  const supabase = createClient();
  const topRef = useRef<HTMLDivElement>(null);

  const now = new Date();

  const [filterMode, setFilterMode] = useState<FilterMode>("month");
  const [month, setMonth] = useState(initialMonth || now.getMonth() + 1);
  const [year, setYear] = useState(initialYear || now.getFullYear());
  const [fromDate, setFromDate] = useState(firstOfMonthISO());
  const [toDate, setToDate] = useState(lastOfMonthISO());
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid" | "partial">(
    highlight === "due" ? "unpaid" : "all"
  );
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [preparedBy, setPreparedBy] = useState(userName);

  // হাইলাইট তারিখ
  const highlightToday = highlight === "today";

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (filterMode === "month") {
        const { data } = await supabase
          .from("fee_payments")
          .select("*")
          .eq("month", month)
          .eq("year", year);
        setPayments(data || []);
      } else {
        const { data } = await supabase
          .from("fee_payments")
          .select("*")
          .gte("payment_date", fromDate)
          .lte("payment_date", toDate);
        setPayments(data || []);
      }
      setLoading(false);
    }
    load();
  }, [filterMode, month, year, fromDate, toDate]);

  // হাইলাইটে স্ক্রল করি
  useEffect(() => {
    if (highlight && topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [highlight]);

  const classes = Array.from(new Set(students.map((s) => s.class_name)));

  // প্রাপ্য হিসাব
  const rows: Row[] = useMemo(() => {
    return students.map((s) => {
      const sp = payments.filter((p) => p.student_id === s.id);
      const paid = sp.reduce((sum, p) => sum + Number(p.amount), 0);
      const payable =
        filterMode === "month"
          ? Number(s.monthly_fee || 0) - Number(s.discount || 0)
          : (Number(s.monthly_fee || 0) - Number(s.discount || 0)) *
            Math.max(1, countMonths(fromDate, toDate));
      const due = payable - paid;

      let status: "paid" | "unpaid" | "partial";
      if (paid >= payable && payable > 0) status = "paid";
      else if (paid === 0) status = "unpaid";
      else status = "partial";

      return { student: s, payable, paid, due, status };
    });
  }, [students, payments, filterMode, fromDate, toDate]);

  function countMonths(from: string, to: string): number {
    const f = new Date(from);
    const t = new Date(to);
    return (t.getFullYear() - f.getFullYear()) * 12 + (t.getMonth() - f.getMonth()) + 1;
  }

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

  // হাইলাইট করা আইডি (today এর জন্য)
  const todayPaymentIds = useMemo(() => {
    if (!highlightToday) return new Set<number>();
    const today = new Date().toISOString().split("T")[0];
    const ids = new Set<number>();
    payments
      .filter((p) => p.payment_date === today)
      .forEach((p) => ids.add(p.student_id));
    return ids;
  }, [highlightToday, payments]);

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

  const filterLabel =
    filterMode === "month"
      ? `${MONTHS[month - 1]} ${toBangla(year)}`
      : `${formatDate(fromDate)} — ${formatDate(toDate)}`;

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

      {/* ==================== স্ক্রিন কন্ট্রোল ==================== */}
      <div ref={topRef} className="no-print max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Paid / Unpaid তালিকা
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            মাস বা তারিখ রেঞ্জ অনুযায়ী হিসাব ও প্রিন্ট
          </p>
        </div>

        {/* হাইলাইট বার্তা */}
        {highlight === "due" && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
              বাকি থাকা শিক্ষার্থীরা দেখানো হচ্ছে — {toBangla(filtered.length)} জন
            </span>
          </div>
        )}

        {highlightToday && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
              আজ বেতন দিয়েছে — {toBangla(todayPaymentIds.size)} জন
            </span>
          </div>
        )}

        {/* সারাংশ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
          <SummaryCard label="মোট শিক্ষার্থী" value={toBangla(students.length)} color="#2563eb" />
          <SummaryCard label="Paid" value={toBangla(paidCount)} color="#15803d" />
          <SummaryCard label="Partial" value={toBangla(partialCount)} color="#b45309" />
          <SummaryCard label="Unpaid" value={toBangla(unpaidOnly)} color="#b91c1c" />
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <MoneyCard label="প্রাপ্য" value={totalPayable} color="#1e40af" />
          <MoneyCard label="আদায়" value={totalPaid} color="#15803d" />
          <MoneyCard label="বাকি" value={totalDue} color="#b91c1c" />
        </div>

        {/* ফিল্টার */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
            <button
              onClick={() => setFilterMode("month")}
              className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                filterMode === "month"
                  ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              📅 মাস অনুযায়ী
            </button>
            <button
              onClick={() => setFilterMode("range")}
              className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                filterMode === "range"
                  ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              📆 তারিখ রেঞ্জ
            </button>
          </div>

          {filterMode === "month" && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">মাস</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">বছর</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {filterMode === "range" && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">শুরুর তারিখ</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">শেষ তারিখ</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">সব শ্রেণি</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">সব স্ট্যাটাস</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম / আইডি / রোল"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none col-span-2 sm:col-span-1"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">প্রস্তুতকারীর নাম</label>
              <input
                type="text"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/25 transition flex items-center gap-2"
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

      {/* ==================== প্রিন্ট এরিয়া ==================== */}
      <div className="print-area max-w-7xl mx-auto px-3 sm:px-4">
        {/* প্রিন্ট হেডার */}
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
            <div><strong>সময়কাল:</strong> {filterLabel}</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        {/* মোবাইল: কার্ড */}
        <div className="md:hidden space-y-2.5 mb-6">
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-sm">লোড হচ্ছে...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 text-sm">
              কোনো ফলাফল পাওয়া যায়নি
            </div>
          ) : (
            filtered.map((r, i) => {
              const sc = statusColor(r.status);
              const isHighlighted = highlightToday && todayPaymentIds.has(r.student.id);

              return (
                <div
                  key={r.student.id}
                  className={`bg-white rounded-2xl overflow-hidden border shadow-sm transition-all ${
                    isHighlighted
                      ? "border-emerald-400 ring-2 ring-emerald-300"
                      : "border-slate-200"
                  }`}
                  style={{ borderLeftWidth: "4px", borderLeftColor: sc.text }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {toBangla(i + 1)}.
                          </span>
                          <h3 className="text-[15px] font-semibold text-slate-900 truncate">
                            {r.student.name}
                          </h3>
                          {isHighlighted && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">
                              আজ
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500">
                          <span className="font-medium">{r.student.class_name}</span>
                          {r.student.roll && <span>• রোল {r.student.roll}</span>}
                          {r.student.student_id && <span>• {r.student.student_id}</span>}
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                        <div className="text-[10px] text-slate-500 mb-0.5">প্রাপ্য</div>
                        <div className="text-[13px] font-bold text-slate-800">
                          ৳{toBangla(r.payable)}
                        </div>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                        <div className="text-[10px] text-emerald-700 mb-0.5">জমা</div>
                        <div className="text-[13px] font-bold text-emerald-700">
                          ৳{toBangla(r.paid)}
                        </div>
                      </div>
                      <div className={`rounded-xl p-2.5 text-center ${r.due > 0 ? "bg-red-50" : "bg-slate-50"}`}>
                        <div className={`text-[10px] mb-0.5 ${r.due > 0 ? "text-red-700" : "text-slate-500"}`}>
                          বাকি
                        </div>
                        <div className={`text-[13px] font-bold ${r.due > 0 ? "text-red-700" : "text-slate-500"}`}>
                          ৳{toBangla(r.due)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setDetailStudent(r.student)}
                    className="no-print w-full py-2.5 border-t border-slate-100 text-brand-700 text-[12px] font-medium hover:bg-brand-50 transition flex items-center justify-center gap-1.5"
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
        </div>

        {/* ডেস্কটপ: টেবিল */}
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
                    const sc = statusColor(r.status);
                    const isHighlighted = highlightToday && todayPaymentIds.has(r.student.id);
                    return (
                      <tr
                        key={r.student.id}
                        className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                          isHighlighted ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                        }`}
                      >
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
                          <span
                            className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ background: sc.bg, color: sc.text }}
                          >
                            {statusLabel(r.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center no-print">
                          <button
                            onClick={() => setDetailStudent(r.student)}
                            className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100 transition"
                          >
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

        {/* প্রিন্ট-অনলি: শ্রেণিভিত্তিক সারসংক্ষেপ */}
        <div className="print-summary hidden print:block mt-6">
          <h3 className="text-sm font-bold text-slate-800 mb-2 text-center">
            শ্রেণিভিত্তিক সারসংক্ষেপ
          </h3>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-brand-600 text-white">
                <th className="border border-slate-300 px-2 py-2 text-left">শ্রেণি</th>
                <th className="border border-slate-300 px-2 py-2 text-center">শিক্ষার্থী</th>
                <th className="border border-slate-300 px-2 py-2 text-right">প্রাপ্য</th>
                <th className="border border-slate-300 px-2 py-2 text-right">জমা</th>
                <th className="border border-slate-300 px-2 py-2 text-right">বাকি</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(
                filtered.reduce((acc, r) => {
                  const k = r.student.class_name;
                  if (!acc[k]) acc[k] = { count: 0, payable: 0, paid: 0, due: 0 };
                  acc[k].count += 1;
                  acc[k].payable += r.payable;
                  acc[k].paid += r.paid;
                  acc[k].due += r.due;
                  return acc;
                }, {} as Record<string, { count: number; payable: number; paid: number; due: number }>)
              ).map(([cls, data]) => (
                <tr key={cls}>
                  <td className="border border-slate-300 px-2 py-1.5 font-medium">{cls}</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center">{toBangla(data.count)}</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-right">৳ {toBangla(data.payable)}</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-right text-emerald-700 font-semibold">৳ {toBangla(data.paid)}</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-right text-red-700 font-semibold">৳ {toBangla(data.due)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100">
                <td colSpan={2} className="border border-slate-300 px-2 py-2 text-right font-bold">সর্বমোট</td>
                <td className="border border-slate-300 px-2 py-2 text-right font-bold">৳ {toBangla(totalPayable)}</td>
                <td className="border border-slate-300 px-2 py-2 text-right font-bold text-emerald-700">৳ {toBangla(totalPaid)}</td>
                <td className="border border-slate-300 px-2 py-2 text-right font-bold text-red-700">৳ {toBangla(totalDue)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="flex justify-between mt-14 pt-2">
            <div className="text-center">
              <div className="border-t border-slate-600 w-40 pt-1 text-xs text-slate-600">
                প্রস্তুতকারীর স্বাক্ষর
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-600 w-40 pt-1 text-xs text-slate-600">
                অনুমোদনকারীর স্বাক্ষর
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 mt-6">
            এই রিপোর্টটি কম্পিউটার দ্বারা স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 shadow-sm" style={{ borderLeftWidth: "3px", borderLeftColor: color }}>
      <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">{label}</div>
      <div className="text-base sm:text-lg font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function MoneyCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 shadow-sm" style={{ borderLeftWidth: "3px", borderLeftColor: color }}>
      <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mb-0.5 truncate">{label}</div>
      <div className="text-sm sm:text-base font-bold" style={{ color }}>৳{toBangla(value)}</div>
    </div>
  );
}
