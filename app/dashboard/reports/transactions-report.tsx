"use client";

import { useState, useMemo } from "react";
import { lastDayOfMonth } from "@/lib/financial";

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

export default function TransactionsReport({
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
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [receiptSearch, setReceiptSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [descSearch, setDescSearch] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (t.date < fromDate || t.date > toDate) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (receiptSearch && !(t.ref_no || "").toLowerCase().includes(receiptSearch.toLowerCase())) return false;
      if (categorySearch && !(t.category || "").toLowerCase().includes(categorySearch.toLowerCase())) return false;
      if (descSearch && !(t.description || "").toLowerCase().includes(descSearch.toLowerCase())) return false;
      return true;
    });
  }, [transactions, fromDate, toDate, typeFilter, receiptSearch, categorySearch, descSearch]);

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  function clearFilters() {
    setReceiptSearch("");
    setCategorySearch("");
    setDescSearch("");
    setTypeFilter("all");
  }

  return (
    <>
      <div className="no-print mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">শুরুর তারিখ</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">শেষের তারিখ</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">ধরন</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="all">সব</option>
              <option value="income">শুধু আয়</option>
              <option value="expense">শুধু ব্যয়</option>
            </select>
          </div>
        </div>

        <div className="mb-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">🔍 রসিদ / ভাউচার নম্বর</label>
            <input
              type="text"
              value={receiptSearch}
              onChange={(e) => setReceiptSearch(e.target.value)}
              placeholder="R-202610-..."
              style={{ ...inp, borderColor: receiptSearch ? "#0f766e" : "#cbd5e1" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">🔍 খাত</label>
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="বেতন, বিদ্যুৎ..."
              className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">🔍 বিবরণ</label>
            <input
              type="text"
              value={descSearch}
              onChange={(e) => setDescSearch(e.target.value)}
              placeholder="কোনো লেখা..."
              className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={() => window.print()} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
            🖨️ Print / PDF
          </button>
          <button onClick={clearFilters} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            ফিল্টার মুছুন
          </button>
        </div>
      </div>

      <div className="print-area min-w-0 max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/10 print:overflow-visible print:rounded-none print:border-0 print:shadow-none">
        <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 via-white to-cyan-50 px-4 py-5 sm:px-6 dark:border-teal-900 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950 print:bg-white" style={{ borderBottom: "2px solid #0f766e" }}>
          <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            <h1 className="mb-1 text-xl font-extrabold tracking-tight text-teal-800 sm:text-2xl dark:text-teal-300 print:text-teal-800" style={{ marginBottom: "0.25rem" }}>দারুল হিকমাহ মডেল মাদ্রাসা</h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400 print:text-slate-600" style={{ fontSize: "0.85rem" }}>ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ</p>
          </div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <div><strong>বিষয়:</strong> লেনদেনের রিপোর্ট</div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div><strong>সময়কাল:</strong> {toBangla(fromDate)} — {toBangla(toDate)}</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
          {(receiptSearch || categorySearch || descSearch) && (
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.35rem" }}>
              {receiptSearch && <span>রসিদ: <strong>{receiptSearch}</strong> </span>}
              {categorySearch && <span>| খাত: <strong>{categorySearch}</strong> </span>}
              {descSearch && <span>| বিবরণ: <strong>{descSearch}</strong></span>}
            </div>
          )}
        </div>

        <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", fontSize: "0.8rem" }}>
          <thead>
            <tr className="bg-teal-700 text-white" style={{ background: "#0f766e", color: "#fff" }}>
              <th style={th}>নং</th>
              <th style={th}>তারিখ</th>
              <th style={th}>ধরন</th>
              <th style={th}>খাত</th>
              <th style={th}>রসিদ / ভাউচার</th>
              <th style={th}>বিবরণ</th>
              <th style={{ ...th, textAlign: "right" }}>পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...td, textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  কোনো লেনদেন নেই
                </td>
              </tr>
            ) : (
              filtered.map((t, i) => (
                <tr key={`${t.type}-${t.id}`} className="transition-colors odd:bg-slate-50/80 hover:bg-teal-50/70 dark:odd:bg-slate-900/60 dark:hover:bg-teal-950/40" style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={td}>{toBangla(i + 1)}</td>
                  <td style={td}>{toBangla(t.date)}</td>
                  <td style={td}>
                    <span style={{
                      padding: "0.12rem 0.45rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "500",
                      background: t.type === "income" ? "#dcfce7" : "#fee2e2",
                      color: t.type === "income" ? "#15803d" : "#b91c1c",
                    }}>
                      {t.type === "income" ? "আয়" : "ব্যয়"}
                    </span>
                  </td>
                  <td style={td}>{t.category || "-"}</td>
                  <td style={{ ...td, fontSize: "0.72rem", fontWeight: "500", color: "#0f766e" }}>{t.ref_no || "-"}</td>
                  <td style={td}>{t.description || "-"}</td>
                  <td style={{ ...td, textAlign: "right", color: t.type === "income" ? "#15803d" : "#b91c1c", fontWeight: "500" }}>
                    ৳ {toBangla(t.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f1f5f9", borderTop: "2px solid #0f766e" }}>
              <td colSpan={6} style={{ ...td, fontWeight: "600", textAlign: "right" }}>
                মোট আয়: ৳ {toBangla(totalIncome)} | মোট ব্যয়: ৳ {toBangla(totalExpense)}
              </td>
              <td style={{ ...td, fontWeight: "700", textAlign: "right", color: (totalIncome - totalExpense) >= 0 ? "#15803d" : "#b91c1c" }}>
                ৳ {toBangla(totalIncome - totalExpense)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

const lbl: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.78rem", color: "#475569", fontWeight: "500" };
const inp: React.CSSProperties = { width: "100%", padding: "0.5rem 0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", background: "#ffffff", fontFamily: "inherit" };
const th: React.CSSProperties = { padding: "0.6rem 0.7rem", textAlign: "left", fontWeight: "600", fontSize: "0.75rem", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.55rem 0.7rem", color: "#1a1a1a" };
