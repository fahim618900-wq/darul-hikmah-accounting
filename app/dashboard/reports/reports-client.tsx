"use client";

import { useState, useMemo } from "react";
import FeesReport from "./fees-report";
import IncomeExpenseReport from "./income-expense-report";
import TransactionsReport from "./transactions-report";
import StudentsReport from "./students-report";

type Student = {
  id: number;
  student_id: string | null;
  name: string;
  class_name: string;
  roll: string | null;
  section: string | null;
  monthly_fee: number;
  discount: number;
  status: string;
};

type Payment = {
  id: number;
  student_id: number;
  month: number;
  year: number;
  amount: number;
  payment_date: string;
  receipt_no: string | null;
  payment_method: string;
};

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

type Tab = "fees" | "income-expense" | "transactions" | "students";

const TABS: { id: Tab; label: string }[] = [
  { id: "fees", label: "বেতন আদায়" },
  { id: "income-expense", label: "আয়-ব্যয়" },
  { id: "transactions", label: "লেনদেন" },
  { id: "students", label: "শিক্ষার্থী" },
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

  const classes = useMemo(
    () => Array.from(new Set(students.map((s) => s.class_name))),
    [students]
  );

  return (
    <>
      {/* ট্যাব — প্রিন্টে লুকানো */}
      <div className="no-print" style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.4rem", color: "#0f766e", marginBottom: "0.25rem" }}>
          রিপোর্ট ড্যাশবোর্ড
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1rem" }}>
          নির্বাচিত সময়ের আয়, ব্যয়, আদায় ও বকেয়ার সারসংক্ষেপ
        </p>

        <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", gap: "0.35rem", overflowX: "auto", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontSize: "0.88rem",
                  fontWeight: "500",
                  border: tab === t.id ? "1px solid #0f766e" : "1px solid #e2e8f0",
                  background: tab === t.id ? "#0f766e" : "#ffffff",
                  color: tab === t.id ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label style={label}>প্রস্তুতকারীর নাম</label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              style={{ ...input, maxWidth: "280px" }}
            />
          </div>
        </div>
      </div>

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
    </>
  );
}

const label: React.CSSProperties = {
  display: "block",
  marginBottom: "0.3rem",
  fontSize: "0.78rem",
  color: "#475569",
  fontWeight: "500",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.7rem",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "0.85rem",
  background: "#ffffff",
  fontFamily: "inherit",
};
