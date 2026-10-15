"use client";

import { useState, useMemo, useLayoutEffect, useRef } from "react";
import { BarChart3, Wallet, Users, FileText, Printer } from "lucide-react";
import { isDateInMonth, calculateFinancialTotals, type FinancialTransaction } from "@/lib/financial";
import FeesReport from "./fees-report";
import IncomeExpenseReport from "./income-expense-report";
import TransactionsReport from "./transactions-report";
import StudentsReport from "./students-report";

type Student = any;
type Payment = any;
type Transaction = any;

type Tab = "fees" | "income-expense" | "transactions" | "students";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "fees",
    label: "বেতন আদায়",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: "income-expense",
    label: "আয়-ব্যয়",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: "transactions",
    label: "লেনদেন",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: "students",
    label: "শিক্ষার্থী",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function ReportsClient({
  students,
  payments,
  transactions,
  incomeCategories,
  expenseCategories,
  userName,
}: {
  students: Student[];
  payments: Payment[];
  transactions: Transaction[];
  incomeCategories: { id: number; name: string }[];
  expenseCategories: { id: number; name: string }[];
  userName: string;
}) {
  const [tab, setTab] = useState<Tab>("fees");
  const [preparedBy, setPreparedBy] = useState(userName);
  const savedScrollY = useRef<number | null>(null);

  // Keep the page at the same vertical position when switching report sections.
  useLayoutEffect(() => {
    if (savedScrollY.current === null) return;
    window.scrollTo(0, savedScrollY.current);
    savedScrollY.current = null;
  }, [tab]);

  function selectReport(nextTab: Tab) {
    if (nextTab === tab) return;
    savedScrollY.current = window.scrollY;
    setTab(nextTab);
  }

  const classes = useMemo(
    () => Array.from(new Set(students.map((s) => s.class_name))),
    [students]
  );

  // চলতি মাসের সারাংশ
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const stats = useMemo(() => {
    // প্রাপ্য বেতন
    const totalPayable = students.reduce(
      (sum, s) => sum + Number(s.monthly_fee || 0) - Number(s.discount || 0),
      0
    );

    // চলতি মাসে আদায়
    const thisMonthPayments = payments.filter(
      (p) => isDateInMonth(p.payment_date, currentMonth, currentYear)
    );
    const totalCollected = thisMonthPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    // চলতি মাসের আয়, ফি আদায়সহ, এবং ব্যয়—একই কেন্দ্রীয় হিসাব থেকে
    const thisMonthTransactions = transactions.filter(
      (t: any) => isDateInMonth(t.date, currentMonth, currentYear)
    );
    const financialTotals = calculateFinancialTotals(thisMonthTransactions as FinancialTransaction[]);
    const totalIncome = financialTotals.totalIncome;
    const totalExpense = financialTotals.totalExpense;

    return {
      totalPayable,
      totalCollected,
      totalIncome,
      totalExpense,
      due: totalPayable - totalCollected,
    };
  }, [students, payments, transactions, currentMonth, currentYear]);

  function toBangla(input: string | number): string {
    const map: Record<string, string> = {
      "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
      "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
    };
    return String(input).replace(/[0-9]/g, (d) => map[d]);
  }

  function formatTaka(amount: number): string {
    return "৳" + toBangla(Math.round(amount).toLocaleString("en-US"));
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-3 pt-5 pb-24 sm:px-4 lg:pb-6">
      {/* ==================== শিরোনাম ==================== */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          রিপোর্ট
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          নির্বাচিত সময়ের আয়, ব্যয়, আদায় ও বকেয়ার সারসংক্ষেপ
        </p>
      </div>

      {/* ==================== সারাংশ কার্ড ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <SummaryCard
          icon={<Wallet size={18} />}
          label="মোট আদায় (চলতি মাস)"
          value={formatTaka(stats.totalCollected)}
          color="#10b981"
          bgGradient="from-emerald-500 to-teal-600"
        />
        <SummaryCard
          icon={<BarChart3 size={18} />}
          label="মোট আয়"
          value={formatTaka(stats.totalIncome)}
          color="#2563eb"
          bgGradient="from-blue-500 to-indigo-600"
        />
        <SummaryCard
          icon={<FileText size={18} />}
          label="মোট ব্যয়"
          value={formatTaka(stats.totalExpense)}
          color="#ef4444"
          bgGradient="from-red-500 to-rose-600"
        />
        <SummaryCard
          icon={<Users size={18} />}
          label="মোট বকেয়া"
          value={formatTaka(stats.due)}
          color="#7c3aed"
          bgGradient="from-purple-500 to-violet-600"
        />
      </div>

      {/* ==================== ট্যাব ==================== */}
      <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-sm shadow-slate-200/40 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-black/10">
        <div role="tablist" aria-label="রিপোর্টের ধরন" className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
          {TABS.map((t) => (
            <button
              type="button"
              role="tab"
              id={`report-tab-${t.id}`}
              aria-controls={`report-panel-${t.id}`}
              aria-selected={tab === t.id}
              key={t.id}
              onClick={() => selectReport(t.id)}
              className={`flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:px-3 sm:text-sm ${
                tab === t.id
                  ? "bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20"
                  : "border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              <span className={tab === t.id ? "text-white" : "text-slate-400"}>
                {t.icon}
              </span>
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================== প্রস্তুতকারীর নাম ==================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              প্রস্তুতকারীর নাম (রিপোর্টে দেখাবে)
            </label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="যিনি রিপোর্ট তৈরি করছেন"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Printer size={14} />
            <span>প্রিন্ট সাইজ: A4 Landscape</span>
          </div>
        </div>
      </div>

      {/* ==================== ট্যাব কনটেন্ট ==================== */}
      <div
        id={`report-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`report-tab-${tab}`}
        className="w-full min-w-0"
      >
        {tab === "fees" && (
          <FeesReport
            students={students}
            payments={payments}
            classes={classes}
            preparedBy={preparedBy}
          />
        )}

        {tab === "income-expense" && (
          <IncomeExpenseReport
            transactions={transactions}
            preparedBy={preparedBy}
          />
        )}

        {tab === "transactions" && (
          <TransactionsReport
            transactions={transactions}
            preparedBy={preparedBy}
          />
        )}

        {tab === "students" && (
          <StudentsReport
            students={students}
            classes={classes}
            preparedBy={preparedBy}
          />
        )}
      </div>
    </div>
  );
}

/* ==================== সারাংশ কার্ড ==================== */
function SummaryCard({
  icon,
  label,
  value,
  bgGradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bgGradient: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${bgGradient} rounded-2xl p-4 text-white shadow-lg relative overflow-hidden`}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] opacity-90 leading-tight">{label}</div>
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            {icon}
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
