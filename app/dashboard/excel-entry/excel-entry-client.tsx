"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type IncomeCategory = { id: number; name: string };
type ColumnTemplate = {
  id: number;
  column_key: string;
  column_label: string;
  column_type: string;
  column_order: number;
  is_default: boolean;
};

type Row = {
  id: string;
  entry_date: string;
  category_id: string;
  amount: string;
  payment_method: string;
  receipt_no: string;
  description: string;
  [key: string]: string;
};

function toBangla(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function makeEmptyRow(): Row {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entry_date: todayISO(),
    category_id: "",
    amount: "",
    payment_method: "cash",
    receipt_no: "",
    description: "",
  };
}

const PAYMENT_METHODS = [
  { value: "cash", label: "নগদ" },
  { value: "bkash", label: "বিকাশ" },
  { value: "nagad", label: "নগদ (Nagad)" },
  { value: "bank", label: "ব্যাংক" },
  { value: "other", label: "অন্যান্য" },
];

export default function ExcelEntryClient({
  incomeCategories,
  initialColumns,
  userName,
}: {
  incomeCategories: IncomeCategory[];
  initialColumns: ColumnTemplate[];
  userName: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const tableEndRef = useRef<HTMLDivElement>(null);

  const [rows, setRows] = useState<Row[]>([makeEmptyRow()]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [newColumnLabel, setNewColumnLabel] = useState("");
  const [columns, setColumns] = useState<ColumnTemplate[]>(initialColumns);

  // মোট
  const total = useMemo(() => {
    return rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [rows]);

  // একটি সারি আপডেট
  function updateRow(id: string, field: string, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  // নতুন সারি
  function addRow() {
    setRows((prev) => [...prev, makeEmptyRow()]);
    setTimeout(() => {
      tableEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  // সারি ডিলিট
  function removeRow(id: string) {
    setRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((r) => r.id !== id);
    });
  }

  // Enter চাপলে নতুন সারি
  function handleKeyDown(e: React.KeyboardEvent, rowId: string, field: string) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const currentIndex = rows.findIndex((r) => r.id === rowId);
      if (currentIndex === rows.length - 1) {
        addRow();
      } else {
        // পরের সারিতে ফোকাস
        const nextRow = rows[currentIndex + 1];
        const nextInput = document.querySelector(
          `[data-row="${nextRow.id}"][data-field="${field}"]`
        ) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  }

  // সব সেভ করি
  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");

    // ভ্যালিডেশন
    const validRows = rows.filter(
      (r) => r.amount && Number(r.amount) > 0 && r.category_id
    );

    if (validRows.length === 0) {
      setError("অন্তত একটি সারি পূরণ করুন (খাত ও পরিমাণ আবশ্যক)");
      setSaving(false);
      return;
    }

    // ডেটা তৈরি
    const payload = validRows.map((r) => ({
      category_id: Number(r.category_id),
      amount: Number(r.amount),
      entry_date: r.entry_date,
      payment_method: r.payment_method,
      receipt_no: r.receipt_no || null,
      description: r.description || null,
      extra_fields: {},
    }));

    const { error: insertError } = await supabase.from("incomes").insert(payload);

    if (insertError) {
      setError("সেভ করতে সমস্যা: " + insertError.message);
      setSaving(false);
      return;
    }

    setMessage(`${toBangla(validRows.length)} টি এন্ট্রি সফলভাবে সেভ হয়েছে`);
    setSaving(false);
    setRows([makeEmptyRow()]);
    router.refresh();

    setTimeout(() => setMessage(""), 4000);
  }

  // নতুন কলাম যোগ করি
  async function handleAddColumn() {
    if (!newColumnLabel.trim()) return;

    const columnKey = `custom_${Date.now()}`;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error: colError } = await supabase
      .from("excel_column_templates")
      .insert({
        page_type: "income",
        column_key: columnKey,
        column_label: newColumnLabel,
        column_type: "text",
        column_order: columns.length + 1,
        is_default: false,
        created_by: user?.id,
      })
      .select()
      .single();

    if (colError) {
      setError("কলাম যোগ করতে সমস্যা: " + colError.message);
      return;
    }

    if (data) {
      setColumns((prev) => [...prev, data]);
    }
    setNewColumnLabel("");
    setShowNewColumn(false);
  }

  // কলাম ডিলিট করি
  async function handleRemoveColumn(columnId: number) {
    const col = columns.find((c) => c.id === columnId);
    if (!col || col.is_default) return;
    if (!confirm(`"${col.column_label}" কলামটি মুছে ফেলতে চান?`)) return;

    const { error: delError } = await supabase
      .from("excel_column_templates")
      .delete()
      .eq("id", columnId);

    if (delError) {
      setError("কলাম মুছতে সমস্যা: " + delError.message);
      return;
    }

    setColumns((prev) => prev.filter((c) => c.id !== columnId));
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-5 pb-32">
      {/* শিরোনাম */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          এক্সেল এন্ট্রি
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          একসাথে অনেক এন্ট্রি করুন — Excel-এর মতো
        </p>
      </div>

      {/* ট্যাব — শুধু আয় এখন */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-1.5">
        <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold">
          💰 আয়
        </button>
        <button
          disabled
          className="flex-1 py-2.5 rounded-xl text-slate-400 text-sm font-semibold opacity-50 cursor-not-allowed"
        >
          📉 ব্যয়
        </button>
        <button
          disabled
          className="flex-1 py-2.5 rounded-xl text-slate-400 text-sm font-semibold opacity-50 cursor-not-allowed"
        >
          👨‍🎓 বেতন
        </button>
      </div>

      {/* সারাংশ কার্ড */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-500/20">
          <div className="text-[11px] opacity-90 mb-1">সর্বমোট আয়</div>
          <div className="text-2xl font-bold">৳{toBangla(Math.round(total))}</div>
          <div className="text-[11px] opacity-80 mt-1">
            {toBangla(rows.filter((r) => r.amount).length)} টি এন্ট্রি
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">সারির সংখ্যা</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {toBangla(rows.length)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {toBangla(rows.filter((r) => r.amount).length)} পূরণ হয়েছে
          </div>
        </div>
      </div>

      {/* কলাম যোগ করার প্যানেল */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowNewColumn(!showNewColumn)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 transition flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            নতুন কলাম
          </button>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 ml-auto">
            {toBangla(columns.length)} টি কলাম
          </div>
        </div>

        {showNewColumn && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={newColumnLabel}
              onChange={(e) => setNewColumnLabel(e.target.value)}
              placeholder="কলামের নাম (যেমন: সূত্র)"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
            <button
              onClick={handleAddColumn}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium"
            >
              যোগ
            </button>
          </div>
        )}
      </div>

      {/* এক্সেল টেবিল */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[900px]">
            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
              <tr>
                <th className="excel-th w-12">#</th>
                <th className="excel-th w-36">তারিখ</th>
                <th className="excel-th w-44">খাত *</th>
                <th className="excel-th w-32">পরিমাণ *</th>
                <th className="excel-th w-32">পদ্ধতি</th>
                <th className="excel-th w-40">রসিদ</th>
                <th className="excel-th">বিবরণ</th>
                {columns
                  .filter((c) => !["amount", "payment_method", "receipt_no", "description"].includes(c.column_key))
                  .map((c) => (
                    <th key={c.id} className="excel-th min-w-[120px]">
                      <div className="flex items-center justify-between gap-1">
                        <span>{c.column_label}</span>
                        {!c.is_default && (
                          <button
                            onClick={() => handleRemoveColumn(c.id)}
                            className="text-red-500 hover:text-red-700"
                            title="কলাম মুছুন"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                <th className="excel-th w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="excel-td text-center text-slate-400 text-xs">
                    {toBangla(index + 1)}
                  </td>
                  <td className="excel-td">
                    <input
                      type="date"
                      value={row.entry_date}
                      onChange={(e) => updateRow(row.id, "entry_date", e.target.value)}
                      className="excel-input"
                      data-row={row.id}
                      data-field="entry_date"
                    />
                  </td>
                  <td className="excel-td">
                    <select
                      value={row.category_id}
                      onChange={(e) => updateRow(row.id, "category_id", e.target.value)}
                      className="excel-input"
                      data-row={row.id}
                      data-field="category_id"
                    >
                      <option value="">-- খাত --</option>
                      {incomeCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="excel-td">
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, row.id, "amount")}
                      placeholder="0"
                      className="excel-input text-right font-semibold"
                      data-row={row.id}
                      data-field="amount"
                    />
                  </td>
                  <td className="excel-td">
                    <select
                      value={row.payment_method}
                      onChange={(e) => updateRow(row.id, "payment_method", e.target.value)}
                      className="excel-input"
                      data-row={row.id}
                      data-field="payment_method"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="excel-td">
                    <input
                      type="text"
                      value={row.receipt_no}
                      onChange={(e) => updateRow(row.id, "receipt_no", e.target.value)}
                      placeholder="R-001"
                      className="excel-input"
                      data-row={row.id}
                      data-field="receipt_no"
                    />
                  </td>
                  <td className="excel-td">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => updateRow(row.id, "description", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, row.id, "description")}
                      placeholder="বিবরণ..."
                      className="excel-input"
                      data-row={row.id}
                      data-field="description"
                    />
                  </td>
                  {columns
                    .filter((c) => !["amount", "payment_method", "receipt_no", "description"].includes(c.column_key))
                    .map((c) => (
                      <td key={c.id} className="excel-td">
                        <input
                          type="text"
                          value={row[c.column_key] || ""}
                          onChange={(e) => updateRow(row.id, c.column_key, e.target.value)}
                          className="excel-input"
                          data-row={row.id}
                          data-field={c.column_key}
                        />
                      </td>
                    ))}
                  <td className="excel-td text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                      className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                      title="সারি মুছুন"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div ref={tableEndRef} />
        </div>

        {/* নতুন সারি */}
        <button
          onClick={addRow}
          className="w-full py-3 border-t border-slate-100 dark:border-slate-800 text-brand-600 dark:text-brand-400 text-sm font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 transition flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          নতুন সারি যোগ করুন (অথবা Enter চাপুন)
        </button>
      </div>

      {/* মেসেজ */}
      {error && (
        <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {message}
        </div>
      )}

      {/* Sticky Bottom Bar — মোট ও Save */}
      <div className="fixed bottom-[68px] lg:bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">মোট আয়</div>
              <div className="text-base font-bold text-emerald-600">
                ৳{toBangla(Math.round(total))}
              </div>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">পূরণ হয়েছে</div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {toBangla(rows.filter((r) => r.amount).length)} / {toBangla(rows.length)}
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || total === 0}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/30 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                সেভ হচ্ছে...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                সেভ করুন
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
