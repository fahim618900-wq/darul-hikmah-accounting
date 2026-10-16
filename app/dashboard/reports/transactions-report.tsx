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

export default function TransactionsReport({
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
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [receiptSearch, setReceiptSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [descSearch, setDescSearch] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (t.date < fromDate || t.date > toDate) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (
        receiptSearch &&
        !(t.ref_no || "").toLowerCase().includes(receiptSearch.toLowerCase())
      )
        return false;
      if (
        categorySearch &&
        !(t.category || "").toLowerCase().includes(categorySearch.toLowerCase())
      )
        return false;
      if (
        descSearch &&
        !(t.description || "").toLowerCase().includes(descSearch.toLowerCase())
      )
        return false;
      return true;
    });
  }, [transactions, fromDate, toDate, typeFilter, receiptSearch, categorySearch, descSearch]);

  // সঠিক হিসাব — filtered থেকে
  const totalIncome = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + Number(t.amount || 0), 0),
    [filtered]
  );

  const totalExpense = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount || 0), 0),
    [filtered]
  );

  const netBalance = totalIncome - totalExpense;

  function clearFilters() {
    setReceiptSearch("");
    setCategorySearch("");
    setDescSearch("");
    setTypeFilter("all");
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* ============ স্ক্রিনে ফিল্টার ============ */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
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
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              ধরন
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
            >
              <option value="all">সব</option>
              <option value="income">শুধু আয়</option>
              <option value="expense">শুধু ব্যয়</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200 transition"
            >
              ফিল্টার মুছুন
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input
            type="text"
            value={receiptSearch}
            onChange={(e) => setReceiptSearch(e.target.value)}
            placeholder="🔍 রসিদ / ভাউচার নম্বর"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
          />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="🔍 খাত"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
          />
          <input
            type="text"
            value={descSearch}
            onChange={(e) => setDescSearch(e.target.value)}
            placeholder="🔍 বিবরণ"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex-1 flex flex-wrap gap-2">
            <Badge label="মোট আয়" value={"৳" + toBangla(Math.round(totalIncome))} color="#15803d" />
            <Badge label="মোট ব্যয়" value={"৳" + toBangla(Math.round(totalExpense))} color="#b91c1c" />
            <Badge
              label="ব্যালেন্স"
              value={"৳" + toBangla(Math.round(netBalance))}
              color={netBalance >= 0 ? "#15803d" : "#b91c1c"}
            />
            <Badge label="মোট লেনদেন" value={toBangla(filtered.length) + " টি"} color="#2563eb" />
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
            <div><strong>বিষয়:</strong> লেনদেনের রিপোর্ট</div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div className="flex justify-between flex-wrap gap-2 text-xs sm:text-sm">
            <div><strong>সময়কাল:</strong> {formatDate(fromDate)} — {formatDate(toDate)}</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        {/* তালিকা */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              কোনো লেনদেন নেই
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="excel-th w-12">নং</th>
                    <th className="excel-th w-28">তারিখ</th>
                    <th className="excel-th w-20">ধরন</th>
                    <th className="excel-th">খাত</th>
                    <th className="excel-th w-32">রসিদ / ভাউচার</th>
                    <th className="excel-th">বিবরণ</th>
                    <th className="excel-th w-24 text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr key={`${t.type}-${t.id}`} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="excel-td text-center text-slate-400 text-xs">
                        {toBangla(i + 1)}
                      </td>
                      <td className="excel-td text-xs">{formatDate(t.date)}</td>
                      <td className="excel-td">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.type === "income"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.type === "income" ? "আয়" : "ব্যয়"}
                        </span>
                      </td>
                      <td className="excel-td text-xs">{t.category || "-"}</td>
                      <td className="excel-td text-[11px] font-mono text-brand-600">
                        {t.ref_no || "-"}
                      </td>
                      <td className="excel-td text-xs">{t.description || "-"}</td>
                      <td
                        className={`excel-td text-right font-bold ${
                          t.type === "income" ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        ৳{toBangla(Math.round(Number(t.amount)))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <td colSpan={6} className="excel-td text-right font-bold">
                      সর্বমোট আয়:
                    </td>
                    <td className="excel-td text-right font-bold text-emerald-700">
                      ৳{toBangla(Math.round(totalIncome))}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="excel-td text-right font-bold">
                      সর্বমোট ব্যয়:
                    </td>
                    <td className="excel-td text-right font-bold text-red-700">
                      ৳{toBangla(Math.round(totalExpense))}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="excel-td text-right font-bold text-brand-700">
                      নিট ব্যালেন্স:
                    </td>
                    <td
                      className={`excel-td text-right font-bold text-lg ${
                        netBalance >= 0 ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      ৳{toBangla(Math.round(netBalance))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

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
