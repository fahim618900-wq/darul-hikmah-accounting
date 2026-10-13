"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Category = { id: number; name: string };
type Income = {
  id: number;
  amount: number;
  entry_date: string;
  payment_method: string;
  receipt_no: string | null;
  description: string | null;
  income_categories: { name: string } | null;
};

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

function paymentMethodLabel(method: string): string {
  switch (method) {
    case "cash": return "নগদ";
    case "bkash": return "বিকাশ";
    case "nagad": return "নগদ (Nagad)";
    case "bank": return "ব্যাংক";
    default: return "অন্যান্য";
  }
}

export default function IncomeClient({
  categories,
  initialIncomes,
}: {
  categories: Category[];
  initialIncomes: Income[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [incomes, setIncomes] = useState(initialIncomes);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category_id: categories[0]?.id || 0,
    amount: "",
    entry_date: todayISO(),
    payment_method: "cash",
    receipt_no: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showList, setShowList] = useState(true);

  const filtered = incomes.filter((i) => {
    if (categoryFilter && i.income_categories?.name !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (i.description || "").toLowerCase().includes(q) ||
        (i.receipt_no || "").toLowerCase().includes(q) ||
        (i.income_categories?.name || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const total = filtered.reduce((sum, i) => sum + Number(i.amount), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.from("incomes").insert({
      category_id: form.category_id,
      amount: Number(form.amount),
      entry_date: form.entry_date,
      payment_method: form.payment_method,
      receipt_no: form.receipt_no || null,
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
      receipt_no: "",
      description: "",
    });
    router.refresh();
    window.location.reload();
  }

  async function handleDelete(id: number) {
    if (!confirm("এই আয় এন্ট্রি ডিলিট করতে চান?")) return;
    const { error } = await supabase.from("incomes").delete().eq("id", id);
    if (error) {
      alert("সমস্যা: " + error.message);
      return;
    }
    setIncomes((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 pb-4">
      {/* শিরোনাম + নতুন আয় বাটন */}
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
            আয় ব্যবস্থাপনা
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            বেতন ছাড়া অন্যান্য আয় এখানে লিখুন
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium shadow-md shadow-brand-500/25 transition flex items-center gap-1.5 shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            নতুন আয়
          </button>
        )}
      </div>

      {/* সারাংশ কার্ড */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 mb-4 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs opacity-90">মোট আয় (ফিল্টার অনুযায়ী)</div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
            <path d="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="text-2xl sm:text-3xl font-bold mb-1">৳{toBangla(total)}</div>
        <div className="text-xs opacity-80">
          মোট {toBangla(filtered.length)} টি এন্ট্রি
        </div>
      </div>

      {/* ============ নতুন আয় ফর্ম ============ */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border-2 border-brand-200 dark:border-brand-900/40 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              নতুন আয় যোগ করুন
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  খাত <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  পরিমাণ (৳) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">৳</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                    min={1}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">তারিখ <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.entry_date}
                  onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">পেমেন্ট পদ্ধতি</label>
                <select
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="cash">নগদ</option>
                  <option value="bkash">বিকাশ</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="bank">ব্যাংক</option>
                  <option value="other">অন্যান্য</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">রসিদ নম্বর</label>
                <input
                  type="text"
                  value={form.receipt_no}
                  onChange={(e) => setForm({ ...form, receipt_no: e.target.value })}
                  placeholder="যেমন: R-001"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">বিবরণ</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="যেমন: দাতার নাম, বিবরণ..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
            </div>

            {error && (
              <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
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

      {/* ============ ফিল্টার ============ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="রসিদ নম্বর / বিবরণ / খাত..."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
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
        </div>
      </div>

      {/* ============ মোবাইল: কার্ড ============ */}
      <div className="md:hidden space-y-2.5 mb-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500 text-sm border border-slate-200 dark:border-slate-800">
            {incomes.length === 0 ? "এখনো কোনো আয় এন্ট্রি নেই" : "কোনো ফলাফল পাওয়া যায়নি"}
          </div>
        ) : (
          filtered.map((i) => (
            <div
              key={i.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm"
              style={{ borderLeftWidth: "4px", borderLeftColor: "#10b981" }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
                    {i.income_categories?.name || "অন্যান্য"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {formatDate(i.entry_date)} • {paymentMethodLabel(i.payment_method)}
                  </div>
                </div>
                <div className="text-base font-bold text-emerald-600 shrink-0">
                  ৳{toBangla(i.amount)}
                </div>
              </div>

              {(i.receipt_no || i.description) && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 mb-3 text-[11px]">
                  {i.receipt_no && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">রসিদ:</span>
                      <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                        {i.receipt_no}
                      </span>
                    </div>
                  )}
                  {i.description && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">বিবরণ:</span>
                      <span className="text-slate-700 dark:text-slate-300 text-right ml-2">
                        {i.description}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => handleDelete(i.id)}
                className="w-full py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[12px] font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center gap-1.5"
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

      {/* ============ ডেস্কটপ: টেবিল ============ */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            {incomes.length === 0 ? "এখনো কোনো আয় এন্ট্রি নেই" : "কোনো ফলাফল পাওয়া যায়নি"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">তারিখ</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">খাত</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">রসিদ</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">বিবরণ</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">পদ্ধতি</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs">পরিমাণ</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 text-xs">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{formatDate(i.entry_date)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {i.income_categories?.name || "-"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-600 dark:text-brand-400">
                      {i.receipt_no || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                      {i.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                      {paymentMethodLabel(i.payment_method)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                      ৳{toBangla(i.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(i.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium hover:bg-red-100 transition"
                      >
                        ডিলিট
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-800 border-t-2 border-brand-600">
                  <td colSpan={5} className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                    সর্বমোট ({toBangla(filtered.length)} টি):
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 text-base">
                    ৳{toBangla(total)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
