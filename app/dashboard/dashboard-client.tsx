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
};

const MONTHS = [
  "জানু", "ফেব", "মার্চ", "এপ্রি", "মে", "জুন",
  "জুলাই", "আগ", "সেপ্ট", "অক্টো", "নভে", "ডিসে",
];

const COLORS = ["#2563eb", "#7c3aed", "#ec4899", "#06b6d4", "#f59e0b", "#10b981"];

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

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // ============ হিসাব ============
  const stats = useMemo(() => {
    const activeStudents = students.length;

    const totalPayable = students.reduce(
      (sum, s) => sum + (Number(s.monthly_fee) - Number(s.discount || 0)),
      0
    );

    const thisMonthPayments = payments.filter(
      (p) => p.month === currentMonth && p.year === currentYear
    );
    const totalCollected = thisMonthPayments.reduce((s, p) => s + Number(p.amount), 0);
    const totalDue = totalPayable - totalCollected;

    const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0);
    const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0);
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
  }, [students, payments, incomes, expenses, currentMonth, currentYear]);

  // ============ লাইন চার্ট: মাসিক আদায় ============
  const lineData = useMemo(() => {
    const monthly: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) monthly[m] = 0;

    payments
      .filter((p) => p.year === currentYear)
      .forEach((p) => {
        monthly[p.month] = (monthly[p.month] || 0) + Number(p.amount);
      });

    return Object.entries(monthly).map(([m, amt]) => ({
      name: MONTHS[Number(m) - 1],
      collection: amt,
    }));
  }, [payments, currentYear]);

  // ============ ডোনাট চার্ট: আয়ের খাত ============
  const donutData = useMemo(() => {
    const byCat: Record<string, number> = {};
    incomes.forEach((i) => {
      const name = i.income_categories?.name || "অন্যান্য";
      byCat[name] = (byCat[name] || 0) + Number(i.amount);
    });
    return Object.entries(byCat).map(([name, value]) => ({ name, value }));
  }, [incomes]);

  // ============ বার চার্ট: শ্রেণিভিত্তিক শিক্ষার্থী ============
  const barData = useMemo(() => {
    const byClass: Record<string, number> = {};
    students.forEach((s) => {
      byClass[s.class_name] = (byClass[s.class_name] || 0) + 1;
    });
    return Object.entries(byClass).map(([name, count]) => ({ name, count }));
  }, [students]);

  const today = new Date();
  const dateStr = `${toBangla(today.getDate())}/${toBangla(today.getMonth() + 1)}/${toBangla(today.getFullYear())}`;

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#334155" : "#e2e8f0";

  return (
    <div style={{ padding: "1.5rem 1rem 6rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* হেডার */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "700", color: textPrimary, marginBottom: "0.25rem" }}>
              হিসাব ড্যাশবোর্ড
            </h1>
            <p style={{ fontSize: "0.9rem", color: textMuted }}>
              আসসালামু আলাইকুম, {userName}
            </p>
          </div>
          <div style={{ background: cardBg, padding: "0.6rem 1rem", borderRadius: "12px", fontSize: "0.85rem", color: textMuted, fontWeight: "500" }}>
            {dateStr}
          </div>
        </div>
      </div>

      {/* মোট ব্যালেন্স কার্ড (বড়, গ্রেডিয়েন্ট) */}
      <div
        style={{
          background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
          borderRadius: "24px",
          padding: "2rem 1.75rem",
          marginBottom: "1.5rem",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px -12px rgba(37, 99, 235, 0.4)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            filter: "blur(30px)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "0.85rem", opacity: 0.85, marginBottom: "0.5rem" }}>
            মোট ব্যালেন্স (চলতি মাস)
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: "700", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
            {formatTaka(stats.balance)}
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>আয়</div>
              <div style={{ fontSize: "1.05rem", fontWeight: "600" }}>
                {formatTaka(stats.totalIncome + stats.totalCollected)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>ব্যয়</div>
              <div style={{ fontSize: "1.05rem", fontWeight: "600" }}>
                {formatTaka(stats.totalExpense)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ৪টি ছোট কার্ড */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "0.85rem",
          marginBottom: "1.5rem",
        }}
      >
        <StatCard label="শিক্ষার্থী" value={toBangla(stats.activeStudents)} suffix="জন" color="#2563eb" cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted} link="/dashboard/students" />
        <StatCard label="প্রাপ্য বেতন" value={formatTaka(stats.totalPayable)} color="#7c3aed" cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted} link="/dashboard/fees-status" />
        <StatCard label="আদায়" value={formatTaka(stats.totalCollected)} color="#10b981" cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted} link="/dashboard/fees-status" />
        <StatCard label="বাকি" value={formatTaka(stats.totalDue)} color="#ef4444" cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted} link="/dashboard/fees-status" />
      </div>

      {/* লাইন চার্ট — মাসিক আদায় */}
      <ChartCard title="মাসিক বেতন আদায়" subtitle={`${toBangla(currentYear)} সালের ধারা`} cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={lineData}>
            <defs>
              <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "none",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "0.85rem",
              }}
              formatter={(value: number) => [formatTaka(value), "আদায়"]}
            />
            <Line
              type="monotone"
              dataKey="collection"
              stroke="url(#lineColor)"
              strokeWidth={3}
              dot={{ fill: "#2563eb", r: 4, strokeWidth: 2, stroke: "#ffffff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* দুইটি চার্ট পাশাপাশি */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {/* ডোনাট — আয়ের খাত */}
        <ChartCard title="আয়ের খাত" subtitle="চলতি মাসের বিভাজন" cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted}>
          {donutData.length === 0 ? (
            <EmptyBox textMuted={textMuted} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
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
                    color: "#ffffff",
                    fontSize: "0.85rem",
                  }}
                  formatter={(value: number) => formatTaka(value)}
                />
                <Legend
                  wrapperStyle={{ fontSize: "0.78rem", color: textMuted }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* বার — শ্রেণিভিত্তিক শিক্ষার্থী */}
        <ChartCard title="শ্রেণিভিত্তিক শিক্ষার্থী" subtitle="প্রতিটি শ্রেণিতে সংখ্যা" cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted}>
          {barData.length === 0 ? (
            <EmptyBox textMuted={textMuted} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <defs>
                  <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "none",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                  }}
                  formatter={(value: number) => [toBangla(value) + " জন", "শিক্ষার্থী"]}
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

function StatCard({
  label,
  value,
  suffix,
  color,
  cardBg,
  textPrimary,
  textMuted,
  link,
}: {
  label: string;
  value: string;
  suffix?: string;
  color: string;
  cardBg: string;
  textPrimary: string;
  textMuted: string;
  link: string;
}) {
  return (
    <Link
      href={link}
      style={{
        background: cardBg,
        borderRadius: "16px",
        padding: "1rem",
        textDecoration: "none",
        border: `1px solid ${color}20`,
        borderLeft: `3px solid ${color}`,
        display: "block",
      }}
    >
      <div style={{ fontSize: "0.72rem", color: textMuted, marginBottom: "0.4rem", fontWeight: "500" }}>
        {label}
      </div>
      <div style={{ fontSize: "1.1rem", fontWeight: "700", color }}>
        {value}
        {suffix && (
          <span style={{ fontSize: "0.75rem", marginLeft: "0.2rem", color: textMuted, fontWeight: "400" }}>
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
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  cardBg: string;
  textPrimary: string;
  textMuted: string;
}) {
  return (
    <div
      style={{
        background: cardBg,
        borderRadius: "20px",
        padding: "1.25rem",
        marginBottom: "0.5rem",
      }}
    >
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: "1rem", fontWeight: "600", color: textPrimary, marginBottom: "0.15rem" }}>
          {title}
        </div>
        <div style={{ fontSize: "0.75rem", color: textMuted }}>
          {subtitle}
        </div>
      </div>
      {children}
    </div>
  );
}

function EmptyBox({ textMuted }: { textMuted: string }) {
  return (
    <div
      style={{
        height: "240px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: textMuted,
        fontSize: "0.9rem",
      }}
    >
      এখনো কোনো ডেটা নেই
    </div>
  );
}
