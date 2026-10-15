"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, TrendingUp, Wallet, AlertCircle, DollarSign, BookOpen, Receipt, PlusCircle, FileText, ArrowUpRight } from "lucide-react";
import { isDateInMonth, isDateInRange, lastDayOfMonth, calculateFinancialTotals } from "@/lib/financial";

type Student = {
  id: number;
  monthly_fee: number;
  discount: number;
  class_name: string;
  status: string;
};

type Payment = {
  student_id: number;
  amount: number;
  month: number;
  year: number;
  payment_date: string;
};

type Income = {
  amount: number;
  entry_date: string;
  category_id: number;
  income_categories: { name: string } | null;
};

type Expense = {
  amount: number;
  entry_date: string;
  category_id: number;
  expense_categories: { name: string } | null;
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const MONTHS_SHORT = [
  "জানু", "ফেব", "মার্চ", "এপ্রি", "মে", "জুন",
  "জুলাই", "আগ", "সেপ্ট", "অক্টো", "নভে", "ডিসে",
];

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
  return lastDayOfMonth(d.getFullYear(), d.getMonth() + 1);
}

type FilterMode = "month" | "range";

export default function DashboardClient({
  students,
  payments,
  incomes,
  expenses,
  userName,
  currentMonth,
  currentYear,
}: {
  students: Student[];
  payments: Payment[];
  incomes: Income[];
  expenses: Expense[];
  userName: string;
  currentMonth: number;
  currentYear: number;
}) {
  const [isDark, setIsDark] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [fromDate, setFromDate] = useState(firstOfMonthISO());
  const [toDate, setToDate] = useState(lastOfMonthISO());

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // ফিল্টার করা ডেটা
  const filtered = useMemo(() => {
    let fIncomes: Income[] = [];
    let fExpenses: Expense[] = [];
    let fPayments: Payment[] = [];

    if (filterMode === "month") {
      fIncomes = incomes.filter((i) => isDateInMonth(i.entry_date, selectedMonth, selectedYear));
      fExpenses = expenses.filter((e) => isDateInMonth(e.entry_date, selectedMonth, selectedYear));
      fPayments = payments.filter(
        (p) => isDateInMonth(p.payment_date, selectedMonth, selectedYear)
      );
    } else {
      fIncomes = incomes.filter((i) => isDateInRange(i.entry_date, fromDate, toDate));
      fExpenses = expenses.filter((e) => isDateInRange(e.entry_date, fromDate, toDate));
      fPayments = payments.filter(
        (p) => isDateInRange(p.payment_date, fromDate, toDate)
      );
    }

    return { fIncomes, fExpenses, fPayments };
  }, [filterMode, selectedMonth, selectedYear, fromDate, toDate, incomes, expenses, payments]);

  // হিসাব
  const stats = useMemo(() => {
    const activeStudents = students.length;

    const totalPayable = students.reduce(
      (sum, s) => sum + (Number(s.monthly_fee) - Number(s.discount || 0)),
      0
    );

    const totalCollected = filtered.fPayments.reduce(
      (s, p) => s + Number(p.amount),
      0
    );
    const totalDue = totalPayable - totalCollected;

    const financialRows = [
      ...filtered.fIncomes.map((i) => ({ source: "direct-income" as const, type: "income" as const, date: i.entry_date, amount: Number(i.amount) || 0, id: 0, category: null, ref_no: null, description: null })),
      ...filtered.fPayments.map((p) => ({ source: "fee-collection" as const, type: "income" as const, date: p.payment_date, amount: Number(p.amount) || 0, id: 0, category: "শিক্ষার্থীদের বেতন/ফি", ref_no: null, description: null })),
      ...filtered.fExpenses.map((e) => ({ source: "expense" as const, type: "expense" as const, date: e.entry_date, amount: Number(e.amount) || 0, id: 0, category: null, ref_no: null, description: null })),
    ];
    const financialTotals = calculateFinancialTotals(financialRows);
    const totalIncome = financialTotals.directIncome;
    const totalExpense = financialTotals.totalExpense;
    const balance = financialTotals.balance;

    return {
      activeStudents,
      totalPayable,
      totalCollected,
      totalDue,
      totalIncome,
      totalExpense,
      balance,
    };
  }, [students, filtered]);

  // লাইন চার্ট — মাসিক বেতন আদায়ের শতাংশ (সবসময় ১২ মাস, নির্বাচিত বছরের)
  const lineData = useMemo(() => {
    const monthly: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) monthly[m] = 0;

    const chartYear = filterMode === "month" ? selectedYear : new Date(fromDate).getFullYear();

    payments
      .filter((p) => Number(String(p.payment_date).slice(0, 4)) === chartYear)
      .forEach((p) => {
        const paidMonth = Number(String(p.payment_date).slice(5, 7));
        if (paidMonth >= 1 && paidMonth <= 12) monthly[paidMonth] = (monthly[paidMonth] || 0) + Number(p.amount);
      });

    const monthlyPayable = students.reduce(
      (sum, student) => sum + (Number(student.monthly_fee) - Number(student.discount || 0)),
      0
    );

    return Object.entries(monthly).map(([m, amount]) => ({
      name: MONTHS_SHORT[Number(m) - 1],
      collectionRate: monthlyPayable > 0 ? Math.round((amount / monthlyPayable) * 100) : 0,
    }));
  }, [payments, students, filterMode, selectedYear, fromDate]);

  // বার — শ্রেণিভিত্তিক শিক্ষার্থী
  const barData = useMemo(() => {
    const byClass: Record<string, number> = {};
    students.forEach((s) => {
      byClass[s.class_name] = (byClass[s.class_name] || 0) + 1;
    });
    return Object.entries(byClass).map(([name, count]) => ({ name, count }));
  }, [students]);

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#334155" : "#e2e8f0";

  const collectionRate =
    stats.totalPayable > 0
      ? Math.round((stats.totalCollected / stats.totalPayable) * 100)
      : 0;

  const filterLabel =
    filterMode === "month"
      ? `${MONTHS[selectedMonth - 1]} ${toBangla(selectedYear)}`
      : `${toBangla(fromDate)} — ${toBangla(toDate)}`;

  return (
    <div className="dashboard-shell max-w-7xl mx-auto px-3 sm:px-5 py-5 sm:py-7 pb-8">
      {/* ============ প্রিমিয়াম ড্যাশবোর্ড হেডার ============ */}
      <section className="mb-5 sm:mb-6">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-[0.18em] text-teal-700 dark:text-teal-300 uppercase mb-2">
          <span className="w-7 h-[2px] rounded-full bg-teal-600 dark:bg-teal-400" />
          DARUL HIKMAH · FINANCE
        </div>
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
              হিসাব ড্যাশবোর্ড
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              আসসালামু আলাইকুম, <span className="font-semibold text-slate-700 dark:text-slate-200">{userName}</span> — মাদরাসার আর্থিক চিত্র এক নজরে।
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"><Wallet size={16} /></span>
            <span><span className="block text-[10px] uppercase tracking-wider text-slate-400">আজকের তারিখ</span><strong className="font-bold">{todayBangla()}</strong></span>
          </div>
        </div>
      </section>

      {/* ============ ফিল্টার ============ */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-3xl p-3.5 sm:p-4 mb-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.22)]">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3">
          <button
            onClick={() => setFilterMode("month")}
            className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              filterMode === "month"
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            📅 মাস অনুযায়ী
          </button>
          <button
            onClick={() => setFilterMode("range")}
            className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              filterMode === "range"
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            📆 তারিখ রেঞ্জ
          </button>
        </div>

        {filterMode === "month" ? (
          <div className="grid grid-cols-2 gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        )}

        <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
          সময়কাল: <strong>{filterLabel}</strong>
        </div>
      </div>

      {/* ============ মোট ব্যালেন্স কার্ড ============ */}
      <div
        style={{
          background: "linear-gradient(125deg, #064e3b 0%, #0f766e 46%, #155e75 100%)",
        }}
        className="dashboard-balance-card rounded-[28px] p-5 sm:p-7 mb-5 text-white shadow-[0_24px_60px_-28px_rgba(13,148,136,0.7)] relative overflow-hidden ring-1 ring-white/10"
      >
        <div className="absolute -top-16 -right-12 w-56 h-56 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-64 h-64 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-6 bottom-4 opacity-[0.08] pointer-events-none"><Wallet size={150} strokeWidth={1} /></div>

        <div className="relative">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs opacity-85 mb-1.5">
                <Wallet size={13} />
                মোট ব্যালেন্স ({filterLabel})
              </div>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight">
                {formatTaka(stats.balance)}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold border border-white/20 shadow-inner">
              <span className="block text-[10px] uppercase tracking-wider text-teal-100/80 mb-0.5">Fee collectionের হার</span>
              <span className="text-lg">{toBangla(collectionRate)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 pt-4 mt-3 border-t border-white/20">
            <div>
              <div className="text-[11px] opacity-75 mb-0.5">মোট আয়</div>
              <div className="text-base sm:text-lg font-bold text-cyan-200">
                {formatTaka(stats.totalIncome + stats.totalCollected)}
              </div>
            </div>
            <div>
              <div className="text-[11px] opacity-75 mb-0.5">মোট ব্যয়</div>
              <div className="text-base sm:text-lg font-bold text-pink-200">
                {formatTaka(stats.totalExpense)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ ৪টি কার্ড ============ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <StatCard
          icon={<Users size={16} />}
          label="শিক্ষার্থী"
          value={toBangla(stats.activeStudents)}
          suffix="জন"
          color="#2563eb"
          cardBg={cardBg}
          textPrimary={textPrimary}
          textMuted={textMuted}
          borderColor={gridColor}
          link="/dashboard/students"
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="প্রাপ্য বেতন"
          value={formatTaka(stats.totalPayable)}
          color="#7c3aed"
          cardBg={cardBg}
          textPrimary={textPrimary}
          textMuted={textMuted}
          borderColor={gridColor}
          link="/dashboard/fees-status"
        />
        <StatCard
          icon={<DollarSign size={16} />}
          label="আদায়"
          value={formatTaka(stats.totalCollected)}
          color="#10b981"
          cardBg={cardBg}
          textPrimary={textPrimary}
          textMuted={textMuted}
          borderColor={gridColor}
          link="/dashboard/fees-status"
        />
        <StatCard
          icon={<AlertCircle size={16} />}
          label="বাকি"
          value={formatTaka(stats.totalDue)}
          color="#ef4444"
          cardBg={cardBg}
          textPrimary={textPrimary}
          textMuted={textMuted}
          borderColor={gridColor}
          link="/dashboard/fees-status"
        />
      </div>

      {/* ============ Quick Actions ============ */}
      <section className="mb-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">দ্রুত কাজ</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Jump to a section</p>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500">QUICK ACCESS</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { href: "/dashboard/students", label: "Students", note: "Student directory", icon: <BookOpen size={18} />, color: "#0f766e", tint: "rgba(13,148,136,.10)" },
            { href: "/dashboard/fees", label: "বেতন আদায়", note: "Record a payment", icon: <Receipt size={18} />, color: "#2563eb", tint: "rgba(37,99,235,.10)" },
            { href: "/dashboard/income", label: "Add income", note: "Income entry", icon: <PlusCircle size={18} />, color: "#7c3aed", tint: "rgba(124,58,237,.10)" },
            { href: "/dashboard/reports", label: "View reports", note: "PDF and print", icon: <FileText size={18} />, color: "#b45309", tint: "rgba(217,119,6,.11)" },
          ].map((action) => (
            <Link key={action.href} href={action.href} className="dashboard-quick-link group flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700">
              <span className="flex shrink-0 items-center justify-center w-10 h-10 rounded-xl" style={{ color: action.color, background: action.tint }}>{action.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{action.label}</span>
                <span className="block text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">{action.note}</span>
              </span>
              <ArrowUpRight size={15} className="shrink-0 text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition" />
            </Link>
          ))}
        </div>
      </section>

      {/* ============ লাইন চার্ট ============ */}
      <ChartCard
        title="Monthly Fee Collection"
        subtitle={`${toBangla(filterMode === "month" ? selectedYear : new Date(fromDate).getFullYear())} monthly collection rate (%)`}
        cardBg={cardBg}
        textPrimary={textPrimary}
        textMuted={textMuted}
        borderColor={gridColor}
      >
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
            <defs>
              <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: textMuted }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => `${toBangla(value)}%`}
            />
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "0.8rem",
              }}
              formatter={(v: number) => [`${toBangla(v)}%`, "Collection rate"]}
            />
            <Line
              type="monotone"
              dataKey="collectionRate"
              name="Collection rate"
              stroke="url(#lineColor)"
              strokeWidth={3}
              dot={{ fill: "#22d3ee", r: 4, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ============ শ্রেণিভিত্তিক শিক্ষার্থী ============ */}
      <div className="grid grid-cols-1 gap-3 mt-3">
        <ChartCard
          title="Students by Class"
          subtitle="Number of students in each class"
          cardBg={cardBg}
          textPrimary={textPrimary}
          textMuted={textMuted}
          borderColor={gridColor}
        >
          {barData.length === 0 ? (
            <EmptyBox textMuted={textMuted} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <defs>
                  <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "0.8rem",
                  }}
                  formatter={(v: number) => [toBangla(v) + " জন", "শিক্ষার্থী"]}
                />
                <Bar dataKey="count" fill="url(#barColor)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

/* ==================== সহায়ক ==================== */

function StatCard({
  icon,
  label,
  value,
  suffix,
  color,
  cardBg,
  textPrimary,
  textMuted,
  borderColor,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  color: string;
  cardBg: string;
  textPrimary: string;
  textMuted: string;
  borderColor: string;
  link: string;
}) {
  return (
    <Link
      href={link}
      className="dashboard-stat-card group relative block overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      style={{
        background: cardBg,
        textDecoration: "none",
        border: `1px solid ${borderColor}`,
        boxShadow: "0 6px 22px -18px rgba(15,23,42,.45)",
      }}
    >
      <span className="absolute left-0 top-0 h-full w-1 rounded-l-2xl" style={{ background: color }} />
      <div className="flex items-start justify-between gap-2 mb-3 pl-1">
        <div className="text-xs sm:text-sm font-semibold leading-snug" style={{ color: textMuted }}>
          {label}
        </div>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0" style={{ color, background: `${color}14` }}>{icon}</div>
      </div>
      <div className="pl-1 break-words" style={{ fontSize: "clamp(1rem, 2.2vw, 1.35rem)", lineHeight: 1.25, fontWeight: 800, letterSpacing: "-0.03em", color: textPrimary }}>
        {value}
        {suffix && (
          <span className="ml-1" style={{ fontSize: "0.72rem", color: textMuted, fontWeight: 500 }}>
            {suffix}
          </span>
        )}
      </div>
      <div className="pl-1 flex items-center gap-1 mt-3 text-[10px] sm:text-xs font-semibold" style={{ color }}>
        View details <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  cardBg,
  textPrimary,
  textMuted,
  borderColor,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  cardBg: string;
  textPrimary: string;
  textMuted: string;
  borderColor: string;
}) {
  return (
    <div
      className="dashboard-chart-card mb-1 rounded-3xl p-4 sm:p-5 transition-shadow hover:shadow-md"
      style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        boxShadow: "0 8px 28px -24px rgba(15,23,42,.45)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 750, letterSpacing: "-0.02em", color: textPrimary, marginBottom: "0.25rem" }}>
            {title}
          </div>
          <div style={{ fontSize: "0.75rem", color: textMuted }}>{subtitle}</div>
        </div>
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 shrink-0"><TrendingUp size={15} /></span>
      </div>
      {children}
    </div>
  );
}

function EmptyBox({ textMuted }: { textMuted: string }) {
  return (
    <div
      style={{
        height: "220px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: textMuted,
        fontSize: "0.85rem",
      }}
    >
      এই সময়ে কোনো ডেটা নেই
    </div>
  );
}
