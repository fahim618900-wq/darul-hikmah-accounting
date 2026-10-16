"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Category = { id: number; name: string };
type ColumnTemplate = {
  id: number;
  column_key: string;
  column_label: string;
  column_order: number;
  is_default: boolean;
};

type CellValue = { [columnKey: string]: string };

type Row = {
  id: string;
  values: CellValue;
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
    values: {},
  };
}

export default function ExcelEntryClient({
  incomeCategories,
  expenseCategories,
  incomeColumns,
  expenseColumns,
  userName,
}: {
  incomeCategories: Category[];
  expenseCategories: Category[];
  incomeColumns: ColumnTemplate[];
  expenseColumns: ColumnTemplate[];
  userName: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"select" | "income" | "expense">("select");
  const [entryDate, setEntryDate] = useState(todayISO());
  const [rows, setRows] = useState<Row[]>([makeEmptyRow()]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnLabel, setNewColumnLabel] = useState("");
  const [customColumns, setCustomColumns] = useState<ColumnTemplate[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const currentCategories =
    mode === "income" ? incomeCategories : expenseCategories;
  const defaultColumns =
    mode === "income" ? incomeColumns : expenseColumns;

  const allColumns = useMemo(() => {
    return [...defaultColumns, ...customColumns].sort(
      (a, b) => a.column_order - b.column_order
    );
  }, [defaultColumns, customColumns]);

  const allCategories = useMemo(() => {
    const extra = allColumns
      .filter((c) => !c.is_default)
      .map((c, i) => ({
        id: -1 - i,
        name: c.column_label,
      }));
    return [...currentCategories, ...extra];
  }, [currentCategories, allColumns]);

  const columnTotals = useMemo(() => {
    const totals: { [columnKey: string]: number } = {};
    allColumns.forEach((col) => {
      totals[col.column_key] = rows.reduce(
        (sum, r) => sum + (Number(r.values[col.column_key]) || 0),
        0
      );
    });
    return totals;
  }, [rows, allColumns]);

  const rowTotals = useMemo(() => {
    return rows.map((r) =>
      allColumns.reduce(
        (sum, col) => sum + (Number(r.values[col.column_key]) || 0),
        0
      )
    );
  }, [rows, allColumns]);

  const grandTotal = useMemo(
    () => rowTotals.reduce((sum, v) => sum + v, 0),
    [rowTotals]
  );

  function addRow() {
    setRows((prev) => [...prev, makeEmptyRow()]);
  }

  function removeRow(id: string) {
    setRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((r) => r.id !== id);
    });
  }

  function updateCell(rowId: string, columnKey: string, value: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, values: { ...r.values, [columnKey]: value } }
          : r
      )
    );
  }

  function handleKeyDown(
    e: React.KeyboardEvent,
    rowId: string,
    columnKey: string
  ) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const idx = rows.findIndex((r) => r.id === rowId);
      if (idx === rows.length - 1) {
        addRow();
      } else {
        const nextRow = rows[idx + 1];
        const nextInput = document.querySelector(
          `[data-row="${nextRow.id}"][data-col="${columnKey}"]`
        ) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  }

  async function handleAddColumn() {
    if (!newColumnLabel.trim()) return;
    if (mode === "select") return;

    const columnKey = `custom_${mode}_${Date.now()}`;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error: colError } = await supabase
      .from("excel_column_templates")
      .insert({
        page_type: mode,
        column_key: columnKey,
        column_label: newColumnLabel.trim(),
        column_order: allColumns.length + 1,
        is_default: false,
        created_by: user?.id,
      })
      .select()
      .single();

    if (colError) {
      setError("কলাম যোগ করতে সমস্যা: " + colError.message);
      return;
    }

    if (data) setCustomColumns((prev) => [...prev, data]);
    setNewColumnLabel("");
    setShowAddColumn(false);
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    if (mode === "select") return;

    const table = mode === "income" ? "income_categories" : "expense_categories";

    const { error: catError } = await supabase
      .from(table)
      .insert({ name: newCategoryName.trim() });

    if (catError) {
      setError("খাত যোগ করতে সমস্যা: " + catError.message);
      return;
    }

    setNewCategoryName("");
    setShowAddCategory(false);
    router.refresh();
  }

  async function handleSave() {
    if (mode === "select") return;

    setSaving(true);
    setError("");
    setMessage("");

    const validRows = rows.filter((r) =>
      Object.values(r.values).some((v) => v && Number(v) > 0)
    );

    if (validRows.length === 0) {
      setError("অন্তত একটি সারিতে টাকা লিখুন");
      setSaving(false);
      return;
    }

    const entries: any[] = [];
    const {
      data: { user },
    } = await supabase.auth.getUser();

    for (const row of validRows) {
      for (const col of allColumns) {
        const amount = Number(row.values[col.column_key]) || 0;
        if (amount <= 0) continue;

        const categoryName = col.column_label;
        let category = allCategories.find((c) => c.name === categoryName);

        if (!category || category.id < 0) {
          const table =
            mode === "income" ? "income_categories" : "expense_categories";
          const { data: newCat } = await supabase
            .from(table)
            .insert({ name: categoryName })
            .select()
            .single();
          category = newCat || undefined;
        }

        if (!category) continue;

        entries.push({
          category_id: category.id,
          amount,
          entry_date: entryDate,
          payment_method: "cash",
          description: null,
          voucher_no: row.values["voucher_no"] || null,
          receipt_no: row.values["receipt_no"] || null,
          extra_columns: {},
          created_by: user?.id,
        });
      }
    }

    if (entries.length === 0) {
      setError("কোনো বৈধ এন্ট্রি নেই");
      setSaving(false);
      return;
    }

    const table = mode === "income" ? "incomes" : "expenses";
    const { error: saveError } = await supabase.from(table).insert(entries);

    if (saveError) {
      setError("সেভ করতে সমস্যা: " + saveError.message);
      setSaving(false);
      return;
    }

    setMessage(
      `${toBangla(entries.length)} টি এন্ট্রি সফলভাবে সেভ হয়েছে। মোট: ৳${toBangla(grandTotal)}`
    );
    setSaving(false);
    setRows([makeEmptyRow()]);
    router.refresh();

    setTimeout(() => setMessage(""), 5000);
  }

  function selectMode(newMode: "income" | "expense") {
    setMode(newMode);
    setRows([makeEmptyRow()]);
    setCustomColumns([]);
    setMessage("");
    setError("");
    setEntryDate(todayISO());
  }

  // ==================== প্রথম স্ক্রিন — বাটন ====================
  if (mode === "select") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            এক্সেল এন্ট্রি
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            আয় অথবা ব্যয় নির্বাচন করুন
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button
            onClick={() => selectMode("income")}
            className="group bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10" />
                <path d="M15 9.5H10.5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4H9" />
              </svg>
            </div>
            <div className="text-2xl font-bold mb-1">আয়</div>
            <p className="text-sm opacity-90">আয়ের এন্ট্রি করুন</p>
          </button>

          <button
            onClick={() => selectMode("expense")}
            className="group bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-3xl p-8 text-white shadow-xl shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M7 14l4-4 3 3 5-6" />
                <path d="M15 7h4v4" />
              </svg>
            </div>
            <div className="text-2xl font-bold mb-1">ব্যয়</div>
            <p className="text-sm opacity-90">ব্যয়ের এন্ট্রি করুন</p>
          </button>
        </div>
      </div>
    );
  }

  const isIncome = mode === "income";

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 pb-44">
      {/* ============ Sticky হেডার ============ */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-3 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setMode("select")}
              className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-medium mb-1.5 hover:gap-3 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              ফিরে যান
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isIncome ? "💰 আয়ের এন্ট্রি" : "📉 ব্যয়ের এন্ট্রি"}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                তারিখ
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                মোট {isIncome ? "আয়" : "ব্যয়"}
              </div>
              <div
                className={`text-xl font-bold ${
                  isIncome ? "text-emerald-600" : "text-red-600"
                }`}
              >
                ৳{toBangla(Math.round(grandTotal))}
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* টুলবার */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => setShowAddColumn(!showAddColumn)}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 transition flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          নতুন কলাম
        </button>
        <button
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 transition flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          নতুন খাত
        </button>
        <div className="ml-auto text-[11px] text-slate-500 flex items-center">
          {toBangla(allColumns.length)} টি কলাম • {toBangla(rows.length)} টি সারি
        </div>
      </div>

      {showAddColumn && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-3 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-2">
          <input
            type="text"
            value={newColumnLabel}
            onChange={(e) => setNewColumnLabel(e.target.value)}
            placeholder="কলামের নাম (যেমন: বেতন)"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          />
          <button
            onClick={handleAddColumn}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium"
          >
            যোগ
          </button>
        </div>
      )}

      {showAddCategory && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-3 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="নতুন খাতের নাম"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium"
          >
            যোগ
          </button>
        </div>
      )}

      {/* ============ টেবিল ============ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="excel-th w-12">ক্রম</th>
                {allColumns.map((col) => (
                  <th key={col.id} className="excel-th min-w-[110px]">
                    {col.column_label}
                  </th>
                ))}
                <th className="excel-th w-24">মোট</th>
                <th className="excel-th w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="excel-td text-center text-slate-400 text-xs">
                    {toBangla(idx + 1)}
                  </td>
                  {allColumns.map((col) => (
                    <td key={col.id} className="excel-td">
                      <input
                        type="number"
                        value={row.values[col.column_key] || ""}
                        onChange={(e) =>
                          updateCell(row.id, col.column_key, e.target.value)
                        }
                        onKeyDown={(e) =>
                          handleKeyDown(e, row.id, col.column_key)
                        }
                        placeholder="০"
                        min={0}
                        data-row={row.id}
                        data-col={col.column_key}
                        className="excel-input text-right font-semibold"
                      />
                    </td>
                  ))}
                  <td className="excel-td text-right font-bold text-brand-600">
                    ৳{toBangla(Math.round(rowTotals[idx]))}
                  </td>
                  <td className="excel-td text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                      className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center disabled:opacity-30"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sticky মোট সারি */}
        <div className="sticky bottom-0 bg-slate-100 dark:bg-slate-800 border-t-2 border-brand-600 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm min-w-[700px]">
              <tbody>
                <tr>
                  <td className="excel-td text-center text-xs font-bold w-12">
                    মোট
                  </td>
                  {allColumns.map((col) => (
                    <td
                      key={col.id}
                      className="excel-td text-right font-bold text-emerald-700 min-w-[110px]"
                    >
                      ৳{toBangla(Math.round(columnTotals[col.column_key] || 0))}
                    </td>
                  ))}
                  <td className="excel-td text-right font-bold text-brand-700 text-base w-24">
                    ৳{toBangla(Math.round(grandTotal))}
                  </td>
                  <td className="w-10"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={addRow}
          className="w-full py-3 border-t border-slate-100 dark:border-slate-800 text-brand-600 dark:text-brand-400 text-sm font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 transition flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          নতুন সারি (Enter চাপুন)
        </button>
      </div>

      {/* সারসংক্ষেপ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          📊 সারসংক্ষেপ
        </h3>
        <div className="space-y-2">
          {allColumns.map((col) => (
            <div
              key={col.id}
              className="flex justify-between items-center py-1.5 border-b border-dotted border-slate-200 dark:border-slate-700 last:border-0"
            >
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {col.column_label} মোট
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                ৳{toBangla(Math.round(columnTotals[col.column_key] || 0))}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-brand-600">
            <span className="text-sm font-bold text-brand-700 dark:text-brand-400">
              সর্বমোট {isIncome ? "আয়" : "ব্যয়"}
            </span>
            <span className="text-lg font-bold text-brand-700 dark:text-brand-400">
              ৳{toBangla(Math.round(grandTotal))}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky সেভ বার */}
      <div className="fixed bottom-[68px] lg:bottom-4 left-0 right-0 z-30 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 flex flex-wrap items-center gap-3">
          <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <div>
              <div className="text-[10px] text-slate-500">মোট</div>
              <div
                className={`text-base font-bold ${
                  isIncome ? "text-emerald-600" : "text-red-600"
                }`}
              >
                ৳{toBangla(Math.round(grandTotal))}
              </div>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
              <div className="text-[10px] text-slate-500">তারিখ</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {entryDate}
              </div>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || grandTotal === 0}
            className={`px-6 py-3 rounded-2xl text-white text-sm font-bold shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isIncome
                ? "bg-gradient-to-r from-emerald-600 to-teal-600"
                : "bg-gradient-to-r from-red-600 to-rose-600"
            }`}
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
