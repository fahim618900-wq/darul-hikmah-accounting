"use client";

import { useState, useMemo } from "react";
import { isDateInMonth, isDateInRange } from "@/lib/financial";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Category = { id: number; name: string };
type Expense = {
  id: number;
  amount: number;
  entry_date: string;
  payment_method: string;
  voucher_no: string | null;
  description: string | null;
  expense_categories: { name: string } | null;
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

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
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

function methodLabel(m: string): string {
  switch (m) {
    case "cash": return "নগদ";
    case "bkash": return "বিকাশ";
    case "nagad": return "নগদ";
    case "bank": return "ব্যাংক";
    default: return "অন্যান্য";
  }
}

type FilterMode = "month" | "range";

export default function ExpensesClient({
  categories,
  initialExpenses,
  userName,
}: {
  categories: Category[];
  initialExpenses: Expense[];
  userName: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const now = new Date();

  // ফিল্টার
  const [filterMode, setFilterMode] = useState<FilterMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [fromDate, setFromDate] = useState(firstOfMonthISO());
  const [toDate, setToDate] = useState(lastOfMonthISO());
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [preparedBy, setPreparedBy] = useState(userName);

  // ফর্ম
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category_id: categories[0]?.id || 0,
    amount: "",
    entry_date: todayISO(),
    payment_method: "cash",
    voucher_no: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expenses, setExpenses] = useState(initialExpenses);

  // ফিল্টার হিসাব
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      // মাস/তারিখ ফিল্টার
      if (filterMode === "month") {
        const d = new Date(e.entry_date);
        if (d.getMonth() + 1 !== selectedMonth) return false;
        if (d.getFullYear() !== selectedYear) return false;
      } else {
        if (!isDateInRange(e.entry_date, fromDate, toDate)) return false;
      }

      if (categoryFilter && e.expense_categories?.name !== categoryFilter) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          (e.description || "").toLowerCase().includes(q) ||
          (e.voucher_no || "").toLowerCase().includes(q) ||
          (e.expense_categories?.name || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [expenses, filterMode, selectedMonth, selectedYear, fromDate, toDate, categoryFilter, search]);

  const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0);
  const thisMonthTotal = expenses
    .filter((e) => {
      const d = new Date(e.entry_date);
      return d.getMonth() + 1 === now.getMonth() + 1 && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.from("expenses").insert({
      category_id: form.category_id,
      amount: Number(form.amount),
      entry_date: form.entry_date,
      payment_method: form.payment_method,
      voucher_no: form.voucher_no || null,
      description: form.description || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setShowForm(false);
    setForm({
      category_id: categories[0]?.id || 0,
      amount: "",
      entry_date: todayISO(),
      payment_method: "cash",
      voucher_no: "",
      description: "",
    });
    router.refresh();
    window.location.reload();
  }

  async function handleDelete(id: number) {
    if (!confirm("এই ব্যয় এন্ট্রি ডিলিট করতে চান?")) return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      alert("সমস্যা: " + error.message);
      return;
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    router.refresh();
  }

  function handlePrint() {
    window.print();
  }

  const filterLabel =
    filterMode === "month"
      ? `${MONTHS[selectedMonth - 1]} ${toBangla(selectedYear)}`
      : `${formatDate(fromDate)} — ${formatDate(toDate)}`;

  return (
    <>
      {/* ==================== স্ক্রিন কন্ট্রোল ==================== */}
      <div className="no-print max-w-6xl mx-auto px-3 sm:px-4 pt-5 pb-4">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
            ব্যয় ব্যবস্থাপনা
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            মাস বা তারিখ রেঞ্জ অনুযায়ী হিসাব ও প্রিন্ট
          </p>
        </div>

        {/* সারাংশ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg shadow-red-500/20 col-span-2 sm:col-span-1">
            <div className="text-[11px] opacity-90 mb-1">নির্বাচিত সময়ের মোট</div>
            <div className="text-2xl font-bold">৳{toBangla(total)}</div>
            <div className="text-[11px] opacity-80 mt-1">{toBangla(filtered.length)} টি এন্ট্রি</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">এই মাসে</div>
            <div className="text-xl font-bold text-red-600">৳{toBangla(thisMonthTotal)}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">মোট এন্ট্রি</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{toBangla(expenses.length)}</div>
          </div>
        </div>

        {/* নতুন ব্যয় বাটন */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full mb-4 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            নতুন ব্যয় যোগ করুন
          </button>
        )}

        {/* ফর্ম */}
        {showForm && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-5 border border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">নতুন ব্যয়</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">নিচের তথ্য পূরণ করুন</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  পরিমাণ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 font-bold text-lg">৳</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                    min={1}
                    placeholder="0"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  খাত <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  তারিখ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.entry_date}
                  onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">পেমেন্ট পদ্ধতি</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "cash", l: "নগদ" },
                    { v: "bkash", l: "বিকাশ" },
                    { v: "nagad", l: "Nagad" },
                    { v: "bank", l: "ব্যাংক" },
                    { v: "other", l: "অন্যান্য" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setForm({ ...form, payment_method: opt.v })}
                      className={`py-3 rounded-2xl text-sm font-semibold transition border-2 ${
                        form.payment_method === opt.v
                          ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-500/25"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300"
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">ভাউচার নম্বর (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={form.voucher_no}
                  onChange={(e) => setForm({ ...form, voucher_no: e.target.value })}
                  placeholder="V-001"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">বিবরণ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="যেমন: শিক্ষক বেতন (নভেম্বর)"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-semibold shadow-lg shadow-red-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      সংরক্ষণ...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      সংরক্ষণ করুন
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ফিল্টার প্যানেল */}
        {!showForm && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* ফিল্টার মোড ট্যাব */}
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

            {/* মাস অনুযায়ী */}
            {filterMode === "month" && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">মাস</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
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
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* তারিখ রেঞ্জ */}
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

            {/* খাত ও সার্চ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="">সব খাত</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ভাউচার / বিবরণ / খাত..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* প্রস্তুতকারী + প্রিন্ট */}
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
        )}
      </div>

      {/* ==================== প্রিন্ট এরিয়া ==================== */}
      <div className="print-area max-w-6xl mx-auto px-3 sm:px-4">
        {/* প্রিন্ট হেডার */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 mb-4 border-b-2 border-red-600">
          <div className="text-center mb-3">
            <h1 className="text-lg sm:text-xl font-bold text-red-600 mb-1">
              দারুল হিকমাহ মডেল মাদ্রাসা
            </h1>
            <p className="text-xs text-slate-500">
              ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
            </p>
          </div>
          <div className="flex justify-between flex-wrap gap-2 text-xs sm:text-sm mb-1">
            <div><strong>বিষয়:</strong> ব্যয়ের হিসাব</div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div className="flex justify-between flex-wrap gap-2 text-xs sm:text-sm">
            <div><strong>সময়কাল:</strong> {filterLabel}</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        {/* তালিকা — মোবাইলে কার্ড */}
        <div className="md:hidden space-y-2.5 mb-4">
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500 text-sm border border-slate-200 dark:border-slate-800">
              এই সময়ে কোনো ব্যয় নেই
            </div>
          ) : (
            filtered.map((e) => (
              <div
                key={e.id}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
                style={{ borderLeftWidth: "4px", borderLeftColor: "#ef4444" }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[11px] font-semibold mb-1.5">
                        {e.expense_categories?.name || "অন্যান্য"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {formatDate(e.entry_date)} • {methodLabel(e.payment_method)}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-red-600 shrink-0">
                      ৳{toBangla(e.amount)}
                    </div>
                  </div>

                  {(e.voucher_no || e.description) && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 mb-3 text-[11px] space-y-1">
                      {e.voucher_no && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">ভাউচার:</span>
                          <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                            {e.voucher_no}
                          </span>
                        </div>
                      )}
                      {e.description && (
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500 shrink-0">বিবরণ:</span>
                          <span className="text-slate-700 dark:text-slate-300 text-right truncate">
                            {e.description}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(e.id)}
                  className="no-print w-full py-2.5 border-t border-slate-100 dark:border-slate-800 text-red-600 text-[12px] font-medium hover:bg-red-50 transition flex items-center justify-center gap-1.5"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                  ডিলিট
                </button>
              </div>
            ))
          )}
        </div>

        {/* তালিকা — ডেস্কটপে টেবিল */}
        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              এই সময়ে কোনো ব্যয় নেই
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">তারিখ</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">খাত</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">ভাউচার</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">বিবরণ</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">পদ্ধতি</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs">পরিমাণ</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 text-xs no-print">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{formatDate(e.entry_date)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[11px] font-medium">
                          {e.expense_categories?.name || "অন্যান্য"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-600 dark:text-brand-400">
                        {e.voucher_no || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                        {e.description || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                        {methodLabel(e.payment_method)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">
                        ৳{toBangla(e.amount)}
                      </td>
                      <td className="px-4 py-3 text-center no-print">
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium hover:bg-red-100 transition"
                        >
                          ডিলিট
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-t-2 border-red-600">
                    <td colSpan={5} className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                      সর্বমোট ({toBangla(filtered.length)} টি):
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600 text-base">
                      ৳{toBangla(total)}
                    </td>
                    <td className="no-print"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* ============ প্রিন্ট-অনলি: খাতভিত্তিক সারসংক্ষেপ ============ */}
        <div className="print-summary hidden print:block mt-6">
          <h3 className="text-sm font-bold text-slate-800 mb-2 text-center">
            খাতভিত্তিক সারসংক্ষেপ
          </h3>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-red-600 text-white">
                <th className="border border-slate-300 px-2 py-2 text-left">খাত</th>
                <th className="border border-slate-300 px-2 py-2 text-right">মোট</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(
                filtered.reduce((acc, e) => {
                  const k = e.expense_categories?.name || "অন্যান্য";
                  acc[k] = (acc[k] || 0) + Number(e.amount);
                  return acc;
                }, {} as Record<string, number>)
              ).map(([cat, amt]) => (
                <tr key={cat}>
                  <td className="border border-slate-300 px-2 py-1.5">{cat}</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-right font-semibold">
                    ৳ {toBangla(amt)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100">
                <td className="border border-slate-300 px-2 py-2 text-right font-bold">সর্বমোট</td>
                <td className="border border-slate-300 px-2 py-2 text-right font-bold text-red-700">
                  ৳ {toBangla(total)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* স্বাক্ষর */}
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
