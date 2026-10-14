"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, TrendingUp, Wallet, AlertCircle, DollarSign } from "lucide-react";

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

const COLORS = ["#22d3ee", "#f472b6", "#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#ef4444"];

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
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return last.toISOString().split("T")[0];
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
      fIncomes = incomes.filter((i) => {
        const d = new Date(i.entry_date);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      });
      fExpenses = expenses.filter((e) => {
        const d = new Date(e.entry_date);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      });
      fPayments = payments.filter(
        (p) => p.month === selectedMonth && p.year === selectedYear
      );
    } else {
      fIncomes = incomes.filter((i) => i.entry_date >= fromDate && i.entry_date <= toDate);
      fExpenses = expenses.filter((e) => e.entry_date >= fromDate && e.entry_date <= toDate);
      fPayments = payments.filter(
        (p) => p.payment_date >= fromDate && p.payment_date <= toDate
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

    const totalIncome = filtered.fIncomes.reduce((s, i) => s + Number(i.amount), 0);
    const totalExpense = filtered.fExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const balance = totalIncome + totalCollected - totalExpense;

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

  // লাইন চার্ট — মাসিক আদায় (সবসময় ১২ মাস, নির্বাচিত বছরের)
  const lineData = useMemo(() => {
    const monthly: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) monthly[m] = 0;

    const chartYear = filterMode === "month" ? selectedYear : new Date(fromDate).getFullYear();

    payments
      .filter((p) => p.year === chartYear)
      .forEach((p) => {
        monthly[p.month] = (monthly[p.month] || 0) + Number(p.amount);
      });

    return Object.entries(monthly).map(([m, amt]) => ({
      name: MONTHS_SHORT[Number(m) - 1],
      collection: amt,
    }));
  }, [payments, filterMode, selectedYear, fromDate]);

  // ডোনাট — আয়ের খাত
  const donutData = useMemo(() => {
    const byCat: Record<string, number> = {};
    filtered.fIncomes.forEach((i) => {
      const name = i.income_categories?.name || "অন্যান্য";
      byCat[name] = (byCat[name] || 0) + Number(i.amount);
    });
    return Object.entries(byCat).map(([name, value]) => ({ name, value }));
  }, [filtered.fIncomes]);

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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 pb-6">
      {/* ============ শিরোনাম ============ */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
              হিসাব ড্যাশবোর্ড
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              আসসালামু আলাইকুম, {userName}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm">
            {todayBangla()}
          </div>
        </div>
      </div>

      {/* ============ ফিল্টার ============ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
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
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b0764 50%, #4c1d95 100%)",
        }}
        className="rounded-3xl p-5 sm:p-7 mb-4 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-56 h-56 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />

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
            <div className="bg-cyan-500/20 px-3 py-1.5 rounded-full text-xs font-medium border border-cyan-400/30">
              Collections: {toBangla(collectionRate)}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-white/20">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
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

      {/* ============ লাইন চার্ট ============ */}
      <ChartCard
        title="মাসিক বেতন আদায়"
        subtitle={`${toBangla(filterMode === "month" ? selectedYear : new Date(fromDate).getFullYear())} সালের ধারা`}
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
            <YAxis tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "0.8rem",
              }}
              formatter={(v: number) => [formatTaka(v), "আদায়"]}
            />
            <Line
              type="monotone"
              dataKey="collection"
              stroke="url(#lineColor)"
              strokeWidth={3}
              dot={{ fill: "#22d3ee", r: 4, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ============ দুইটি চার্ট ============ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <ChartCard
          title="আয়ের খাত"
          subtitle={filterLabel}
          cardBg={cardBg}
          textPrimary={textPrimary}
          textMuted={textMuted}
          borderColor={gridColor}
        >
          {donutData.length === 0 ? (
            <EmptyBox textMuted={textMuted} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "0.8rem",
                  }}
                  formatter={(v: number) => formatTaka(v)}
                />
                <Legend
                  wrapperStyle={{ fontSize: "0.72rem", color: textMuted }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="শ্রেণিভিত্তিক শিক্ষার্থী"
          subtitle="প্রতিটি শ্রেণিতে সংখ্যা"
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
      className="block"
      style={{
        background: cardBg,
        borderRadius: "16px",
        padding: "0.85rem",
        textDecoration: "none",
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div style={{ fontSize: "0.7rem", color: textMuted, fontWeight: 500 }}>
          {label}
        </div>
        <div style={{ color, opacity: 0.8 }}>{icon}</div>
      </div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color }}>
        {value}
        {suffix && (
          <span style={{ fontSize: "0.7rem", marginLeft: "0.2rem", color: textMuted, fontWeight: 400 }}>
            {suffix}
          </span>
        )}
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
      className="mb-1"
      style={{
        background: cardBg,
        borderRadius: "20px",
        padding: "1.1rem",
        border: `1px solid ${borderColor}`,
      }}
    >
      <div style={{ marginBottom: "0.85rem" }}>
        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: textPrimary, marginBottom: "0.1rem" }}>
          {title}
        </div>
        <div style={{ fontSize: "0.72rem", color: textMuted }}>{subtitle}</div>
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
