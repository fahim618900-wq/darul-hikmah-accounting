"use client";

import { useState, useMemo } from "react";
import { lastDayOfMonth, calculateFinancialTotals, isDateInRange, type FinancialTransaction } from "@/lib/financial";

type Transaction = {
  type: "income" | "expense";
  source: "direct-income" | "fee-collection" | "expense";
  id: number;
  date: string;
  category: string | null;
  amount: number;
  ref_no: string | null;
  description: string | null;
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

export default function IncomeExpenseReport({
  transactions,
  preparedBy,
}: {
  transactions: Transaction[];
  preparedBy: string;
}) {
  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastOfMonth = lastDayOfMonth(now.getFullYear(), now.getMonth() + 1);

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(lastOfMonth);

  const filtered = useMemo(() => {
    return transactions.filter((t) => isDateInRange(t.date, fromDate, toDate));
  }, [transactions, fromDate, toDate]);

  const incomeRows = filtered.filter((t) => t.type === "income");
  const expenseRows = filtered.filter((t) => t.type === "expense");

  const totals = calculateFinancialTotals(filtered as FinancialTransaction[]);
  const totalIncome = totals.totalIncome;
  const totalExpense = totals.totalExpense;
  const balance = totals.balance;

  // খাতভিত্তিক সারসংক্ষেপ
  const incomeByCategory: Record<string, number> = {};
  incomeRows.forEach((t) => {
    const cat = t.category || "অন্যান্য";
    incomeByCategory[cat] = (incomeByCategory[cat] || 0) + Number(t.amount);
  });

  const expenseByCategory: Record<string, number> = {};
  expenseRows.forEach((t) => {
    const cat = t.category || "অন্যান্য";
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(t.amount);
  });

  return (
    <>
      <div className="no-print mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">শুরুর তারিখ</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">শেষের তারিখ</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
        </div>
        <button onClick={() => window.print()} className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
          🖨️ Print / PDF
        </button>
      </div>

      <div className="print-area min-w-0 max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/10 print:overflow-visible print:rounded-none print:border-0 print:shadow-none">
        <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 via-white to-cyan-50 px-4 py-5 sm:px-6 dark:border-teal-900 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950 print:bg-white" style={{ borderBottom: "2px solid #0f766e" }}>
          <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            <h1 className="mb-1 text-xl font-extrabold tracking-tight text-teal-800 sm:text-2xl dark:text-teal-300 print:text-teal-800" style={{ marginBottom: "0.25rem" }}>দারুল হিকমাহ মডেল মাদ্রাসা</h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400 print:text-slate-600" style={{ fontSize: "0.85rem" }}>ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ</p>
          </div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <div><strong>বিষয়:</strong> আয়-ব্যয় রিপোর্ট</div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div><strong>সময়কাল:</strong> {toBangla(fromDate)} — {toBangla(toDate)}</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        <div className="border-b border-slate-100 px-4 py-4 sm:px-6 dark:border-slate-800 print:bg-white" style={{ background: "#ffffff", padding: "1.25rem 1.5rem" }}>
          <h3 className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2 text-base font-bold text-slate-800 dark:border-slate-800 dark:text-slate-100 print:text-teal-800" style={{ fontSize: "1.05rem", color: "#0f766e", marginBottom: "0.75rem" }}>সারসংক্ষেপ</h3>
          <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td className="font-medium text-slate-600 dark:text-slate-300" style={{ padding: "0.6rem 0", color: "#475569" }}>মোট আয়</td>
                <td style={{ padding: "0.6rem 0", textAlign: "right", color: "#15803d", fontWeight: "600" }}>৳ {toBangla(totalIncome)}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td className="font-medium text-slate-600 dark:text-slate-300" style={{ padding: "0.6rem 0", color: "#475569" }}>মোট ব্যয়</td>
                <td style={{ padding: "0.6rem 0", textAlign: "right", color: "#b91c1c", fontWeight: "600" }}>৳ {toBangla(totalExpense)}</td>
              </tr>
              <tr style={{ borderBottom: "2px solid #0f766e" }}>
                <td className="font-bold text-teal-800 dark:text-teal-300" style={{ padding: "0.6rem 0", color: "#0f766e", fontWeight: "600" }}>নিট উদ্বৃত্ত</td>
                <td style={{ padding: "0.6rem 0", textAlign: "right", color: balance >= 0 ? "#15803d" : "#b91c1c", fontWeight: "700" }}>৳ {toBangla(balance)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-b border-slate-100 px-4 py-4 sm:px-6 dark:border-slate-800 print:bg-white" style={{ background: "#ffffff", padding: "1.25rem 1.5rem" }}>
          <h3 className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2 text-base font-bold text-slate-800 dark:border-slate-800 dark:text-slate-100 print:text-teal-800" style={{ fontSize: "1.05rem", color: "#0f766e", marginBottom: "0.75rem" }}>আয়ের খাতভিত্তিক সারসংক্ষেপ</h3>
          {Object.keys(incomeByCategory).length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>কোনো আয় নেই</p>
          ) : (
            <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", border: "1px solid #e2e8f0" }}>
              <thead>
                <tr className="bg-teal-700 text-white" style={{ background: "#0f766e", color: "#fff" }}>
                  <th style={th}>খাত</th>
                  <th style={{ ...th, textAlign: "right" }}>পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(incomeByCategory).map(([cat, amt]) => (
                  <tr key={cat} className="transition-colors odd:bg-slate-50/80 hover:bg-teal-50/70 dark:odd:bg-slate-900/60 dark:hover:bg-teal-950/40" style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={td}>{cat}</td>
                    <td style={{ ...td, textAlign: "right", color: "#15803d", fontWeight: "500" }}>৳ {toBangla(amt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-b border-slate-100 px-4 py-4 sm:px-6 dark:border-slate-800 print:bg-white" style={{ background: "#ffffff", padding: "1.25rem 1.5rem" }}>
          <h3 className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2 text-base font-bold text-slate-800 dark:border-slate-800 dark:text-slate-100 print:text-teal-800" style={{ fontSize: "1.05rem", color: "#0f766e", marginBottom: "0.75rem" }}>ব্যয়ের খাতভিত্তিক সারসংক্ষেপ</h3>
          {Object.keys(expenseByCategory).length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>কোনো ব্যয় নেই</p>
          ) : (
            <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", border: "1px solid #e2e8f0" }}>
              <thead>
                <tr className="bg-teal-700 text-white" style={{ background: "#0f766e", color: "#fff" }}>
                  <th style={th}>খাত</th>
                  <th style={{ ...th, textAlign: "right" }}>পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(expenseByCategory).map(([cat, amt]) => (
                  <tr key={cat} className="transition-colors odd:bg-slate-50/80 hover:bg-teal-50/70 dark:odd:bg-slate-900/60 dark:hover:bg-teal-950/40" style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={td}>{cat}</td>
                    <td style={{ ...td, textAlign: "right", color: "#b91c1c", fontWeight: "500" }}>৳ {toBangla(amt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

const lbl: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.78rem", color: "#475569", fontWeight: "500" };
const inp: React.CSSProperties = { width: "100%", padding: "0.5rem 0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", background: "#ffffff", fontFamily: "inherit" };
const th: React.CSSProperties = { padding: "0.6rem 0.8rem", textAlign: "left", fontWeight: "600", fontSize: "0.78rem" };
const td: React.CSSProperties = { padding: "0.6rem 0.8rem", color: "#1a1a1a" };
