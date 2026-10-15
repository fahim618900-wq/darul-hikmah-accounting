"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import StudentDetailModal from "./student-detail-modal";
import { getFeePaymentsForMonth, getFeePaymentsForFeeMonthRange, lastDayOfMonth, todayDateKey } from "@/lib/financial";

type Student = {
  id: number;
  student_id: string | null;
  name: string;
  class_name: string;
  section: string | null;
  roll: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
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
  return lastDayOfMonth(d.getFullYear(), d.getMonth() + 1);
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
  highlightDate = "",
  initialMonth,
  initialYear,
}: {
  students: Student[];
  userName: string;
  highlight?: string;
  highlightDate?: string;
  initialMonth?: number;
  initialYear?: number;
}) {
  const supabase = createClient();
  const topRef = useRef<HTMLDivElement>(null);
  const highlightRowRef = useRef<HTMLElement | null>(null);

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
  const targetDate = highlightDate || todayDateKey();

  // ফি-স্ট্যাটাসে নির্বাচিত মাস/মাসগুলোর জন্য ফি-পিরিয়ড অনুযায়ী পেমেন্ট গণনা করি।
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = filterMode === "month"
          ? await getFeePaymentsForMonth(supabase, month, year)
          : await getFeePaymentsForFeeMonthRange(
              supabase,
              Number(fromDate.slice(5, 7)),
              Number(fromDate.slice(0, 4)),
              Number(toDate.slice(5, 7)),
              Number(toDate.slice(0, 4))
            );
        if (!cancelled) setPayments(data || []);
      } catch (error) {
        console.error("Unable to load fee status payments", error);
        if (!cancelled) setPayments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [filterMode, month, year, fromDate, toDate]);

  const printPayments = payments;

  // হাইলাইটে স্ক্রল করি
  useEffect(() => {
    if (!highlight) return;
    const timer = window.setTimeout(() => {
      (highlightRowRef.current || topRef.current)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [highlight, payments.length]);

  const classes = Array.from(new Set(students.map((s) => s.class_name)));

  // Payable হিসাব
  const rows: Row[] = useMemo(() => {
    return students.map((s) => {
      const sp = payments.filter((p) => p.student_id === s.id);
      const paid = sp.reduce((sum, p) => sum + Number(p.amount), 0);
      const monthlyPayable = Math.max(0, Number(s.monthly_fee || 0) - Number(s.discount || 0));
      const payable =
        filterMode === "month"
          ? monthlyPayable
          : monthlyPayable * countMonths(fromDate, toDate);
      const due = Math.max(0, payable - paid);

      let status: "paid" | "unpaid" | "partial";
      if (payable <= 0 || paid >= payable) status = "paid";
      else if (paid === 0) status = "unpaid";
      else status = "partial";

      return { student: s, payable, paid, due, status };
    });
  }, [students, payments, filterMode, fromDate, toDate]);

  function countMonths(from: string, to: string): number {
    if (!from || !to || from > to) return 0;
    const fromMonth = Number(from.slice(0, 4)) * 12 + Number(from.slice(5, 7));
    const toMonth = Number(to.slice(0, 4)) * 12 + Number(to.slice(5, 7));
    return Math.max(0, toMonth - fromMonth + 1);
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
    const today = targetDate;
    const ids = new Set<number>();
    payments
      .filter((p) => p.payment_date === today)
      .forEach((p) => ids.add(p.student_id));
    return ids;
  }, [highlightToday, payments, targetDate]);

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
            Paid / Unpaid List
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View and print fee status by month or date range
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
              Due থাকা শিক্ষার্থীরা দেখানো হচ্ছে — {toBangla(filtered.length)} জন
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
              Paid today — {toBangla(todayPaymentIds.size)} জন
            </span>
          </div>
        )}

        {/* সারাংশ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
          <SummaryCard label="Total Students" value={toBangla(students.length)} color="#2563eb" />
          <SummaryCard label="Paid" value={toBangla(paidCount)} color="#15803d" />
          <SummaryCard label="Partial" value={toBangla(partialCount)} color="#b45309" />
          <SummaryCard label="Unpaid" value={toBangla(unpaidOnly)} color="#b91c1c" />
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <MoneyCard label="Payable" value={totalPayable} color="#1e40af" />
          <MoneyCard label="Collected" value={totalPaid} color="#15803d" />
          <MoneyCard label="Due" value={totalDue} color="#b91c1c" />
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
              📅 By Month
            </button>
            <button
              onClick={() => setFilterMode("range")}
              className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                filterMode === "range"
                  ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              📆 Date Range
            </button>
          </div>

          {filterMode === "month" && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Month</label>
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
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Year</label>
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
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">End Date</label>
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
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name / ID / roll"
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

      {/* ==================== Print এরিয়া ==================== */}
      <div className="print-area max-w-7xl mx-auto px-3 sm:px-4">
        {/* Print হেডার */}
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
            <div><strong>Report:</strong> Paid / Unpaid List ({statusText})</div>
            <div><strong>Date:</strong> {todayBangla()}</div>
          </div>
          <div className="flex justify-between flex-wrap gap-2 text-xs sm:text-sm">
            <div><strong>Period:</strong> {filterLabel}</div>
            <div><strong>Prepared by:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        {/* Mobile: compact, no-horizontal-scroll table */}
        <div className="md:hidden mb-6 print:hidden w-full min-w-0">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 bg-slate-50 px-3 py-2.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <span>Student / Phone</span><span>Class · Status</span>
            </div>
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No students found</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((r, i) => {
                  const sc = statusColor(r.status);
                  const isHighlighted = (highlightToday && todayPaymentIds.has(r.student.id)) || (highlight === "due" && r.status !== "paid");
                  return (
                    <button
                      type="button"
                      key={r.student.id}
                      ref={(element) => { if (isHighlighted && !highlightRowRef.current) highlightRowRef.current = element; }}
                      onClick={() => setDetailStudent(r.student)}
                      className={`grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-3 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 dark:hover:bg-slate-800/70 ${isHighlighted ? (highlight === "due" ? "bg-amber-50 ring-1 ring-inset ring-amber-300 dark:bg-amber-900/20" : "bg-emerald-50 ring-1 ring-inset ring-emerald-300 dark:bg-emerald-900/20") : ""}`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-bold text-slate-900 dark:text-white">{r.student.name}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-slate-500 dark:text-slate-400">{r.student.guardian_phone || "No phone"}</span>
                      </span>
                      <span className="flex max-w-[112px] flex-col items-end gap-1">
                        <span className="max-w-full truncate text-[11px] font-medium text-slate-700 dark:text-slate-200">{r.student.class_name}</span>
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: sc.bg, color: sc.text }}>{statusLabel(r.status)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <p className="mt-1.5 text-center text-[10px] text-slate-400">Tap a student to view details</p>
        </div>

        {/* ডেস্কটপ: টেবিল */}
        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6 print:hidden">
          {loading ? (
            <div className="text-center py-12 text-slate-500">লোড হচ্ছে...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No results found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">No.</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">Student</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">Class</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">Roll</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs">Payable</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs">Collected</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs">Due</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 text-xs">Status</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 text-xs no-print">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const sc = statusColor(r.status);
                    const isHighlighted = (highlightToday && todayPaymentIds.has(r.student.id)) || (highlight === "due" && r.status !== "paid");
                    return (
                      <tr
                        key={r.student.id}
                        ref={(element) => { if (isHighlighted && !highlightRowRef.current) highlightRowRef.current = element; }}
                        className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                          isHighlighted ? (highlight === "due" ? "bg-amber-100 ring-1 ring-inset ring-amber-300 dark:bg-amber-900/30 dark:ring-amber-700" : "bg-emerald-100 ring-1 ring-inset ring-emerald-300 dark:bg-emerald-900/30 dark:ring-emerald-700") : ""
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
                      Total ({toBangla(filtered.length)} students):
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

        {/* Print-অনলি: Excel-style Paid / Unpaid List */}
        <div className="fees-status-print-summary hidden print:block mt-2">
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr>
                <th className="border border-slate-500 px-1.5 py-2 text-center w-[5%]">ক্রমিক</th>
                <th className="border border-slate-500 px-1.5 py-2 text-left w-[19%]">Student Name ও Class</th>
                <th className="border border-slate-500 px-1.5 py-2 text-left w-[13%]">Guardian Phone</th>
                <th className="border border-slate-500 px-1.5 py-2 text-left w-[15%]">অভিভাবকের Student</th>
                <th className="border border-slate-500 px-1.5 py-2 text-left w-[15%]">Outstanding Months</th>
                <th className="border border-slate-500 px-1.5 py-2 text-left w-[18%]">Monthly Due</th>
                <th className="border border-slate-500 px-1.5 py-2 text-right w-[9%]">মোট Due (৳)</th>
                <th className="border border-slate-500 px-1.5 py-2 text-center w-[6%]">Checked</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const netMonthlyFee = Math.max(0, Number(r.student.monthly_fee || 0) - Number(r.student.discount || 0));
                const monthDues = (filterMode === "month"
                  ? [{ month, year }]
                  : (() => {
                      const result: { month: number; year: number }[] = [];
                      const from = new Date(fromDate + "T12:00:00");
                      const to = new Date(toDate + "T12:00:00");
                      const cursor = new Date(from.getFullYear(), from.getMonth(), 1, 12);
                      const last = new Date(to.getFullYear(), to.getMonth(), 1, 12);
                      while (cursor <= last) {
                        result.push({ month: cursor.getMonth() + 1, year: cursor.getFullYear() });
                        cursor.setMonth(cursor.getMonth() + 1);
                      }
                      return result;
                    })()
                ).map((period) => {
                  const paidForMonth = printPayments
                    .filter((p) => p.student_id === r.student.id && p.month === period.month && p.year === period.year)
                    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
                  return { ...period, due: Math.max(0, netMonthlyFee - paidForMonth) };
                }).filter((period) => period.due > 0);
                const printDue = monthDues.reduce((sum, period) => sum + period.due, 0);
                return (
                  <tr key={r.student.id} className="print-row">
                    <td className="border border-slate-400 px-1.5 py-2 text-center">{toBangla(i + 1)}</td>
                    <td className="border border-slate-400 px-1.5 py-2">
                      <div className="font-semibold">{r.student.name}</div>
                      <div className="text-[9px] text-slate-600">Class: {r.student.class_name}{r.student.roll ? " · Roll: " + r.student.roll : ""}</div>
                    </td>
                    <td className="border border-slate-400 px-1.5 py-2">{r.student.guardian_phone || "—"}</td>
                    <td className="border border-slate-400 px-1.5 py-2">{r.student.guardian_name || "—"}</td>
                    <td className="border border-slate-400 p-1 align-top">
                      {monthDues.length ? (
                        <table className="w-full border-collapse text-[9px]">
                          <tbody>
                            {monthDues.map((period) => (
                              <tr key={period.year + "-" + period.month}>
                                <td className="border border-slate-300 px-1 py-1">{MONTHS[period.month - 1]}{filterMode === "range" ? " " + toBangla(period.year) : ""}</td>
                                <td className="border border-slate-300 px-1 py-1 text-right">{period.due > 0 ? "Due" : "Paid"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : "—"}
                    </td>
                    <td className="border border-slate-400 p-1 align-top">
                      {monthDues.length ? (
                        <table className="w-full border-collapse text-[9px]">
                          <tbody>
                            {monthDues.map((period) => (
                              <tr key={period.year + "-" + period.month}>
                                <td className="border border-slate-300 px-1 py-1">{MONTHS[period.month - 1]}</td>
                                <td className="border border-slate-300 px-1 py-1 text-right">৳{toBangla(period.due)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : "—"}
                    </td>
                    <td className="border border-slate-400 px-1.5 py-2 text-right font-semibold">{toBangla(printDue)}</td>
                    <td className="border border-slate-400 px-1.5 py-2 text-center">
                      <span className="print-checkbox inline-block w-4 h-4 border border-slate-700 align-middle"></span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className="border border-slate-500 px-2 py-2 text-right font-bold">Total ({toBangla(filtered.length)} জন)</td>
                <td className="border border-slate-500 px-1.5 py-2 text-right font-bold">{toBangla(filtered.reduce((sum, r) => {
                  const netMonthlyFee = Math.max(0, Number(r.student.monthly_fee || 0) - Number(r.student.discount || 0));
                  const periods = filterMode === "month"
                    ? [{ month, year }]
                    : (() => {
                        const result: { month: number; year: number }[] = [];
                        const from = new Date(fromDate + "T12:00:00");
                        const to = new Date(toDate + "T12:00:00");
                        const cursor = new Date(from.getFullYear(), from.getMonth(), 1, 12);
                        const last = new Date(to.getFullYear(), to.getMonth(), 1, 12);
                        while (cursor <= last) {
                          result.push({ month: cursor.getMonth() + 1, year: cursor.getFullYear() });
                          cursor.setMonth(cursor.getMonth() + 1);
                        }
                        return result;
                      })();
                  return sum + periods.reduce((dueSum, period) => {
                    const paidForMonth = printPayments
                      .filter((p) => p.student_id === r.student.id && p.month === period.month && p.year === period.year)
                      .reduce((paidSum, p) => paidSum + Number(p.amount || 0), 0);
                    return dueSum + Math.max(0, netMonthlyFee - paidForMonth);
                  }, 0);
                }, 0))}</td>
                <td className="border border-slate-500"></td>
              </tr>
            </tfoot>
          </table>

          <div className="flex justify-between mt-12 pt-2">
            <div className="text-center">
              <div className="border-t border-slate-600 w-40 pt-1 text-xs text-slate-600">Prepared by</div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-600 w-40 pt-1 text-xs text-slate-600">Verified by</div>
            </div>
          </div>
          <div className="text-center text-[9px] text-slate-500 mt-4">Generated by the Madrasa Accounting System.</div>
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
