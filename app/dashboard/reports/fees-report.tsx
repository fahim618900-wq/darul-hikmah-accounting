"use client";

import { useState, useMemo } from "react";

type Student = {
  id: number;
  student_id: string | null;
  name: string;
  class_name: string;
  roll: string | null;
  section: string | null;
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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
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

type FilterMode = "month" | "range";

export default function FeesReport({
  students,
  payments,
  classes,
  preparedBy,
}: {
  students: Student[];
  payments: Payment[];
  classes: string[];
  preparedBy: string;
}) {
  const now = new Date();
  const [filterMode, setFilterMode] = useState<FilterMode>("month");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [fromDate, setFromDate] = useState(firstOfMonthISO());
  const [toDate, setToDate] = useState(lastOfMonthISO());
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid" | "partial">("all");
  const [search, setSearch] = useState("");

  // ফিল্টার করা পেমেন্ট
  const filteredPayments = useMemo(() => {
    if (filterMode === "month") {
      return payments.filter((p) => p.month === month && p.year === year);
    } else {
      return payments.filter(
        (p) => p.payment_date >= fromDate && p.payment_date <= toDate
      );
    }
  }, [payments, filterMode, month, year, fromDate, toDate]);

  // শিক্ষার্থীভিত্তিক হিসাব
  const rows = useMemo(() => {
    return students.map((s) => {
      const sp = filteredPayments.filter((p) => p.student_id === s.id);
      const paid = sp.reduce((sum, p) => sum + Number(p.amount), 0);

      // প্রাপ্য হিসাব — মাস অনুযায়ী বা মাস সংখ্যা × বেতন
      let payable: number;
      if (filterMode === "month") {
        payable = Number(s.monthly_fee || 0) - Number(s.discount || 0);
      } else {
        const months = countMonths(fromDate, toDate);
        payable = (Number(s.monthly_fee || 0) - Number(s.discount || 0)) * months;
      }

      const due = payable - paid;

      let status: "paid" | "unpaid" | "partial";
      if (paid >= payable && payable > 0) status = "paid";
      else if (paid === 0) status = "unpaid";
      else status = "partial";

      const sorted = [...sp].sort(
        (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      );
      const lastReceiptNo = sorted[0]?.receipt_no || null;

      return { student: s, payable, paid, due, status, lastReceiptNo };
    });
  }, [students, filteredPayments, filterMode, fromDate, toDate]);

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
        (r.student.roll || "").toLowerCase().includes(q) ||
        (r.lastReceiptNo || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPayable = filtered.reduce((s, r) => s + r.payable, 0);
  const totalPaid = filtered.reduce((s, r) => s + r.paid, 0);
  const totalDue = filtered.reduce((s, r) => s + r.due, 0);

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
      {/* ============ স্ক্রিনে ফিল্টার ============ */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* ফিল্টার মোড ট্যাব */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3">
          <button
            onClick={() => setFilterMode("month")}
            className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              filterMode === "month"
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            📅 মাস অনুযায়ী
          </button>
          <button
            onClick={() => setFilterMode("range")}
            className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              filterMode === "range"
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            📆 তারিখ রেঞ্জ
          </button>
        </div>

        {filterMode === "month" ? (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">মাস</label>
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
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">বছর</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">শুরুর তারিখ</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">শেষ তারিখ</label>
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
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম / আইডি / রোল / রসিদ"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none col-span-2 sm:col-span-1"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-2 flex-1 flex-wrap">
            <SummaryBadge label="মোট" value={toBangla(filtered.length) + " জন"} color="#2563eb" />
            <SummaryBadge label="প্রাপ্য" value={"৳" + toBangla(totalPayable)} color="#1e40af" />
            <SummaryBadge label="জমা" value={"৳" + toBangla(totalPaid)} color="#15803d" />
            <SummaryBadge label="বাকি" value={"৳" + toBangla(totalDue)} color="#b91c1c" />
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

      {/* ============ স্ক্রিনে মোবাইল কার্ড ============ */}
      <div className="md:hidden space-y-2.5 mb-4 print:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500 text-sm border border-slate-200 dark:border-slate-800">
            কোনো ফলাফল পাওয়া যায়নি
          </div>
        ) : (
          filtered.map((r) => {
            const sc =
              r.status === "paid"
                ? { bg: "#f0fdf4", text: "#15803d", badge: "#dcfce7", label: "Paid" }
                : r.status === "unpaid"
                ? { bg: "#fef2f2", text: "#b91c1c", badge: "#fee2e2", label: "Unpaid" }
                : { bg: "#fffbeb", text: "#b45309", badge: "#fef3c7", label: "Partial" };

            return (
              <div
                key={r.student.id}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
                style={{ borderLeftWidth: "4px", borderLeftColor: sc.text }}
              >
                <div className="px-4 py-3 flex items-start justify-between gap-3" style={{ background: sc.bg }}>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-slate-900 truncate mb-1">
                      {r.student.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500">
                      <span className="font-medium">{r.student.class_name}</span>
                      {r.student.roll && <span>• রোল {r.student.roll}</span>}
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                    style={{ background: sc.badge, color: sc.text }}
                  >
                    {sc.label}
                  </span>
                </div>

                <div className="px-4 py-3 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400 mb-0.5">প্রাপ্য</div>
                    <div className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                      ৳{toBangla(r.payable)}
                    </div>
                  </div>
                  <div className="text-center border-x border-slate-100 dark:border-slate-800">
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

                {r.lastReceiptNo && (
                  <div className="px-4 pb-3 text-[10px] text-slate-400">
                    শেষ রসিদ: <span className="font-mono text-brand-600">{r.lastReceiptNo}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ============ স্ক্রিনে ডেস্কটপ টেবিল ============ */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4 print:hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">কোনো ফলাফল পাওয়া যায়নি</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">নং</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">নাম</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">শ্রেণি</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">রোল</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">নির্ধারিত</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">জমা</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">বাকি</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">শেষ রসিদ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const badge =
                    r.status === "paid" ? { bg: "#dcfce7", text: "#15803d", label: "Paid" }
                    : r.status === "unpaid" ? { bg: "#fee2e2", text: "#b91c1c", label: "Unpaid" }
                    : { bg: "#fef3c7", text: "#b45309", label: "Partial" };

                  return (
                    <tr key={r.student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 text-slate-500 text-xs">{toBangla(i + 1)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{r.student.name}</td>
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
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-600 dark:text-brand-400 font-mono">
                        {r.lastReceiptNo || "-"}
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

      {/* ============ প্রিন্ট-অনলি ============ */}
      <div className="hidden print:block print-area">
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f766e", marginBottom: "4px" }}>
            দারুল হিকমাহ মডেল মাদ্রাসা
          </h1>
          <p style={{ fontSize: "11px", color: "#475569" }}>
            ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
          <div><strong>বিষয়:</strong> বেতন আদায় রিপোর্ট ({statusText})</div>
          <div><strong>তারিখ:</strong> {todayBangla()}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "12px" }}>
          <div><strong>সময়কাল:</strong> {filterLabel}</div>
          <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr style={{ background: "#0f766e", color: "#ffffff" }}>
              <th style={{ border: "1px solid #999", padding: "5px" }}>নং</th>
              <th style={{ border: "1px solid #999", padding: "5px" }}>নাম</th>
              <th style={{ border: "1px solid #999", padding: "5px" }}>শ্রেণি</th>
              <th style={{ border: "1px solid #999", padding: "5px" }}>রোল</th>
              <th style={{ border: "1px solid #999", padding: "5px", textAlign: "right" }}>নির্ধারিত</th>
              <th style={{ border: "1px solid #999", padding: "5px", textAlign: "right" }}>জমা</th>
              <th style={{ border: "1px solid #999", padding: "5px", textAlign: "right" }}>বাকি</th>
              <th style={{ border: "1px solid #999", padding: "5px", textAlign: "center" }}>স্ট্যাটাস</th>
              <th style={{ border: "1px solid #999", padding: "5px" }}>শেষ রসিদ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.student.id}>
                <td style={{ border: "1px solid #999", padding: "4px" }}>{toBangla(i + 1)}</td>
                <td style={{ border: "1px solid #999", padding: "4px" }}>{r.student.name}</td>
                <td style={{ border: "1px solid #999", padding: "4px" }}>
                  {r.student.class_name}
                  {r.student.section && ` (${r.student.section})`}
                </td>
                <td style={{ border: "1px solid #999", padding: "4px" }}>{r.student.roll || "-"}</td>
                <td style={{ border: "1px solid #999", padding: "4px", textAlign: "right" }}>৳ {toBangla(r.payable)}</td>
                <td style={{ border: "1px solid #999", padding: "4px", textAlign: "right" }}>৳ {toBangla(r.paid)}</td>
                <td style={{ border: "1px solid #999", padding: "4px", textAlign: "right" }}>৳ {toBangla(r.due)}</td>
                <td style={{ border: "1px solid #999", padding: "4px", textAlign: "center" }}>
                  {r.status === "paid" ? "Paid" : r.status === "unpaid" ? "Unpaid" : "Partial"}
                </td>
                <td style={{ border: "1px solid #999", padding: "4px", fontSize: "9px" }}>{r.lastReceiptNo || "-"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f1f5f9", fontWeight: "bold" }}>
              <td colSpan={4} style={{ border: "1px solid #999", padding: "5px", textAlign: "right" }}>
                সর্বমোট ({toBangla(filtered.length)} জন):
              </td>
              <td style={{ border: "1px solid #999", padding: "5px", textAlign: "right" }}>৳ {toBangla(totalPayable)}</td>
              <td style={{ border: "1px solid #999", padding: "5px", textAlign: "right" }}>৳ {toBangla(totalPaid)}</td>
              <td style={{ border: "1px solid #999", padding: "5px", textAlign: "right" }}>৳ {toBangla(totalDue)}</td>
              <td colSpan={2} style={{ border: "1px solid #999" }}></td>
            </tr>
          </tfoot>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", fontSize: "11px" }}>
          <div style={{ textAlign: "center", minWidth: "150px" }}>
            <div style={{ borderTop: "1px solid #475569", paddingTop: "4px" }}>প্রস্তুতকারীর স্বাক্ষর</div>
          </div>
          <div style={{ textAlign: "center", minWidth: "150px" }}>
            <div style={{ borderTop: "1px solid #475569", paddingTop: "4px" }}>অনুমোদনকারীর স্বাক্ষর</div>
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="px-3 py-1.5 rounded-xl flex items-center gap-2"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <span className="text-[10px] text-slate-500 dark:text-slate-400">{label}:</span>
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
