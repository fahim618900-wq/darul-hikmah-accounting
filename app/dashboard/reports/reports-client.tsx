"use client";

import { useState, useMemo } from "react";
import { BarChart3, Wallet, Users, FileText, Printer } from "lucide-react";
import FeesReport from "./fees-report";
import IncomeExpenseReport from "./income-expense-report";
import TransactionsReport from "./transactions-report";
import StudentsReport from "./students-report";
import EventsReport from "./events-report";

type Student = any;
type Payment = any;
type Transaction = any;

type Tab = "fees" | "income-expense" | "transactions" | "students" | "events";

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
  {
    id: "events",
    label: "ইভেন্ট ফি",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M9 14l2 2 4-4" />
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
  events,
  eventFees,
  eventPayments,
}: {
  students: Student[];
  payments: Payment[];
  transactions: Transaction[];
  incomeCategories: { id: number; name: string }[];
  expenseCategories: { id: number; name: string }[];
  userName: string;
  events: any[];
  eventFees: any[];
  eventPayments: any[];
}) {
  const [tab, setTab] = useState<Tab>("fees");
  const [preparedBy, setPreparedBy] = useState(userName);

  const classes = useMemo(
    () => Array.from(new Set(students.map((s) => s.class_name))),
    [students]
  );

  // চলতি মাসের সারাংশ
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const monthEnd = new Date(currentYear, currentMonth, 0).toISOString().split("T")[0];

  const stats = useMemo(() => {
    const totalPayable = students.reduce(
      (sum, s) => sum + Number(s.monthly_fee || 0) - Number(s.discount || 0),
      0
    );

    const thisMonthPayments = payments.filter(
      (p) => p.month === currentMonth && p.year === currentYear
    );
    const totalCollected = thisMonthPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    const thisMonthIncomes = transactions.filter(
      (t: any) => t.type === "income" && t.date >= monthStart && t.date <= monthEnd
    );
    const totalIncome = thisMonthIncomes.reduce(
      (sum: number, i: any) => sum + Number(i.amount),
      0
    );

    const thisMonthExpenses = transactions.filter(
      (t: any) => t.type === "expense" && t.date >= monthStart && t.date <= monthEnd
    );
    const totalExpense = thisMonthExpenses.reduce(
      (sum: number, e: any) => sum + Number(e.amount),
      0
    );

    return {
      totalPayable,
      totalCollected,
      totalIncome,
      totalExpense,
      due: totalPayable - totalCollected,
    };
  }, [students, payments, transactions, currentMonth, currentYear, monthStart, monthEnd]);

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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-5 pb-6">
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                tab === t.id
                  ? "bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-md shadow-brand-500/25"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
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
      <div>
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

        {tab === "events" && (
          <EventsReport
            events={events}
            eventFees={eventFees}
            eventPayments={eventPayments}
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
