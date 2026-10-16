"use client";

import { useState, useMemo } from "react";

type Transaction = {
  type: string;
  id: number;
  date: string;
  category: string | null;
  amount: number;
  ref_no: string | null;
  description: string | null;
  payment_method: string;
};

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
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())}`;
}

export default function IncomeExpenseReport({
  transactions,
  preparedBy,
}: {
  transactions: Transaction[];
  preparedBy: string;
}) {
  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(lastOfMonth);

  // ফিল্টার
  const filtered = useMemo(() => {
    return transactions.filter((t) => t.date >= fromDate && t.date <= toDate);
  }, [transactions, fromDate, toDate]);

  const incomeRows = useMemo(
    () => filtered.filter((t) => t.type === "income"),
    [filtered]
  );
  const expenseRows = useMemo(
    () => filtered.filter((t) => t.type === "expense"),
    [filtered]
  );

  const totalIncome = useMemo(
    () => incomeRows.reduce((s, t) => s + Number(t.amount || 0), 0),
    [incomeRows]
  );
  const totalExpense = useMemo(
    () => expenseRows.reduce((s, t) => s + Number(t.amount || 0), 0),
    [expenseRows]
  );
  const balance = totalIncome - totalExpense;

  // ==================== খাতভিত্তিক গ্রুপ (আয়) ====================
  const incomeCategories = useMemo(() => {
    const cats = new Set<string>();
    incomeRows.forEach((t) => cats.add(t.category || "অন্যান্য"));
    return Array.from(cats).sort();
  }, [incomeRows]);

  // তারিখভিত্তিক গ্রুপ (আয়)
  const incomeByDate = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    incomeRows.forEach((t) => {
      const date = t.date;
      const cat = t.category || "অন্যান্য";
      if (!map[date]) map[date] = {};
      map[date][cat] = (map[date][cat] || 0) + Number(t.amount || 0);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [incomeRows]);

  // কলামের মোট (আয়)
  const incomeColumnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    incomeCategories.forEach((cat) => {
      totals[cat] = incomeRows
        .filter((t) => (t.category || "অন্যান্য") === cat)
        .reduce((s, t) => s + Number(t.amount || 0), 0);
    });
    return totals;
  }, [incomeRows, incomeCategories]);

  // ==================== খাতভিত্তিক গ্রুপ (ব্যয়) ====================
  const expenseCategories = useMemo(() => {
    const cats = new Set<string>();
    expenseRows.forEach((t) => cats.add(t.category || "অন্যান্য"));
    return Array.from(cats).sort();
  }, [expenseRows]);

  const expenseByDate = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    expenseRows.forEach((t) => {
      const date = t.date;
      const cat = t.category || "অন্যান্য";
      if (!map[date]) map[date] = {};
      map[date][cat] = (map[date][cat] || 0) + Number(t.amount || 0);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [expenseRows]);

  const expenseColumnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenseCategories.forEach((cat) => {
      totals[cat] = expenseRows
        .filter((t) => (t.category || "অন্যান্য") === cat)
        .reduce((s, t) => s + Number(t.amount || 0), 0);
    });
    return totals;
  }, [expenseRows, expenseCategories]);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* ============ স্ক্রিনে ফিল্টার ============ */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              শুরুর তারিখ
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              শেষের তারিখ
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex-1 flex flex-wrap gap-2">
            <Badge label="মোট আয়" value={"৳" + toBangla(Math.round(totalIncome))} color="#15803d" />
            <Badge label="মোট ব্যয়" value={"৳" + toBangla(Math.round(totalExpense))} color="#b91c1c" />
            <Badge
              label="নিট উদ্বৃত্ত"
              value={"৳" + toBangla(Math.round(balance))}
              color={balance >= 0 ? "#15803d" : "#b91c1c"}
            />
          </div>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md transition flex items-center gap-2"
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

      {/* ============ প্রিন্ট এরিয়া ============ */}
      <div className="print-area">
        {/* প্রিন্ট হেডার */}
        <div className="bg-white rounded-2xl px-4 sm:px-6 py-4 mb-4 border-b-2 border-brand-600">
          <div className="text-center mb-3">
            <h1 className="text-lg sm:text-xl font-bold text-brand-700 mb-1">
              দারুল হিকমাহ মডেল মাদ্রাসা
            </h1>
            <p className="text-xs text-slate-500">
              ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
            </p>
          </div>
          <div className="flex justify-between flex-wrap gap-2 text-xs sm:text-sm mb-1">
            <div><strong>বিষয়:</strong> আয়-ব্যয়ের রিপোর্ট</div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div className="flex justify-between flex-wrap gap-2 text-xs sm:text-sm">
            <div><strong>সময়কাল:</strong> {formatDate(fromDate)} — {formatDate(toDate)}</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        {/* ============ ১. সারসংক্ষেপ ============ */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            📊 সারসংক্ষেপ
          </h3>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-2.5 text-slate-600 dark:text-slate-400">মোট আয়</td>
                <td className="py-2.5 text-right font-bold text-emerald-700">
                  ৳{toBangla(Math.round(totalIncome))}
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-2.5 text-slate-600 dark:text-slate-400">মোট ব্যয়</td>
                <td className="py-2.5 text-right font-bold text-red-700">
                  ৳{toBangla(Math.round(totalExpense))}
                </td>
              </tr>
              <tr className="border-b-2 border-brand-600">
                <td className="py-2.5 text-brand-700 dark:text-brand-400 font-bold">
                  নিট উদ্বৃত্ত
                </td>
                <td
                  className={`py-2.5 text-right font-bold text-lg ${
                    balance >= 0 ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  ৳{toBangla(Math.round(balance))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ============ ২. আয়ের এক্সেল সারসংক্ষেপ ============ */}
        {incomeByDate.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 pb-2 border-b border-emerald-100 dark:border-emerald-900/40">
              💰 আয়ের খাতভিত্তিক সারসংক্ষেপ
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-600 text-white">
                    <th className="border border-emerald-700 px-2 py-2 text-left w-24">তারিখ</th>
                    {incomeCategories.map((cat) => (
                      <th key={cat} className="border border-emerald-700 px-2 py-2 text-right">
                        {cat}
                      </th>
                    ))}
                    <th className="border border-emerald-700 px-2 py-2 text-right bg-emerald-700">
                      মোট
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incomeByDate.map(([date, cats]) => {
                    const rowTotal = Object.values(cats).reduce((s, v) => s + v, 0);
                    return (
                      <tr key={date} className="border-b border-slate-200 dark:border-slate-800">
                        <td className="border border-slate-300 px-2 py-1.5 font-medium">
                          {formatDate(date)}
                        </td>
                        {incomeCategories.map((cat) => (
                          <td
                            key={cat}
                            className="border border-slate-300 px-2 py-1.5 text-right"
                          >
                            {cats[cat] ? "৳" + toBangla(Math.round(cats[cat])) : "-"}
                          </td>
                        ))}
                        <td className="border border-slate-300 px-2 py-1.5 text-right font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20">
                          ৳{toBangla(Math.round(rowTotal))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 dark:bg-emerald-900/20 font-bold">
                    <td className="border border-slate-300 px-2 py-2 text-right">মোট</td>
                    {incomeCategories.map((cat) => (
                      <td
                        key={cat}
                        className="border border-slate-300 px-2 py-2 text-right text-emerald-700"
                      >
                        ৳{toBangla(Math.round(incomeColumnTotals[cat] || 0))}
                      </td>
                    ))}
                    <td className="border border-slate-300 px-2 py-2 text-right text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40">
                      ৳{toBangla(Math.round(totalIncome))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ============ ৩. ব্যয়ের এক্সেল সারসংক্ষেপ ============ */}
        {expenseByDate.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-3 pb-2 border-b border-red-100 dark:border-red-900/40">
              📉 ব্যয়ের খাতভিত্তিক সারসংক্ষেপ
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="border border-red-700 px-2 py-2 text-left w-24">তারিখ</th>
                    {expenseCategories.map((cat) => (
                      <th key={cat} className="border border-red-700 px-2 py-2 text-right">
                        {cat}
                      </th>
                    ))}
                    <th className="border border-red-700 px-2 py-2 text-right bg-red-700">
                      মোট
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenseByDate.map(([date, cats]) => {
                    const rowTotal = Object.values(cats).reduce((s, v) => s + v, 0);
                    return (
                      <tr key={date} className="border-b border-slate-200 dark:border-slate-800">
                        <td className="border border-slate-300 px-2 py-1.5 font-medium">
                          {formatDate(date)}
                        </td>
                        {expenseCategories.map((cat) => (
                          <td
                            key={cat}
                            className="border border-slate-300 px-2 py-1.5 text-right"
                          >
                            {cats[cat] ? "৳" + toBangla(Math.round(cats[cat])) : "-"}
                          </td>
                        ))}
                        <td className="border border-slate-300 px-2 py-1.5 text-right font-bold text-red-700 bg-red-50 dark:bg-red-900/20">
                          ৳{toBangla(Math.round(rowTotal))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-red-50 dark:bg-red-900/20 font-bold">
                    <td className="border border-slate-300 px-2 py-2 text-right">মোট</td>
                    {expenseCategories.map((cat) => (
                      <td
                        key={cat}
                        className="border border-slate-300 px-2 py-2 text-right text-red-700"
                      >
                        ৳{toBangla(Math.round(expenseColumnTotals[cat] || 0))}
                      </td>
                    ))}
                    <td className="border border-slate-300 px-2 py-2 text-right text-red-700 bg-red-100 dark:bg-red-900/40">
                      ৳{toBangla(Math.round(totalExpense))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* স্বাক্ষর */}
        <div className="hidden print:flex justify-between mt-14 pt-2">
          <div className="text-center" style={{ minWidth: "150px" }}>
            <div style={{ borderTop: "1px solid #475569", paddingTop: "4px", fontSize: "11px" }}>
              প্রস্তুতকারীর স্বাক্ষর
            </div>
          </div>
          <div className="text-center" style={{ minWidth: "150px" }}>
            <div style={{ borderTop: "1px solid #475569", paddingTop: "4px", fontSize: "11px" }}>
              অনুমোদনকারীর স্বাক্ষর
            </div>
          </div>
        </div>

        <div className="hidden print:block text-center text-[10px] text-slate-500 mt-6">
          এই রিপোর্টটি কম্পিউটার দ্বারা স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।
        </div>
      </div>
    </>
  );
}

function Badge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="px-3 py-1.5 rounded-xl flex items-center gap-2"
      style={{ background: `${color}10`, border: `1px solid ${color}30` }}
    >
      <span className="text-[10px] text-slate-500 dark:text-slate-400">{label}:</span>
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
