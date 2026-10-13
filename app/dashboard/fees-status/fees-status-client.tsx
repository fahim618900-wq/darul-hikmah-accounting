
"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "@/lib/supabase/client";
import StudentDetailModal from "./student-detail-modal";

type Student = {
  id: number;
  student_id: string | null;
  name: string;
  class_name: string;
  section: string | null;
  roll: string | null;
  monthly_fee: number;
  discount: number;
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

type Status = "paid" | "unpaid" | "partial";
type Filter = "all" | Status;

type Row = {
  student: Student;
  payable: number;
  paid: number;
  due: number;
  status: Status;
  payments: Payment[];
  lastPaymentDate: string | null;
  lastReceiptNo: string | null;
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল",
  "মে", "জুন", "জুলাই", "আগস্ট",
  "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "সব শিক্ষার্থী" },
  { id: "paid", label: "Paid তালিকা" },
  { id: "unpaid", label: "Unpaid তালিকা" },
  { id: "partial", label: "Partial তালিকা" },
];

const money = (value: number) =>
  `৳ ${value.toLocaleString("bn-BD")}`;

export default function FeesStatusClient({
  students,
}: {
  students: Student[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailStudent, setDetailStudent] =
    useState<Student | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPayments() {
      setLoading(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("fee_payments")
        .select(
          "id, student_id, month, year, amount, payment_date, receipt_no, payment_method"
        )
        .eq("month", month)
        .eq("year", year);

      if (cancelled) return;

      if (queryError) {
        setPayments([]);
        setError("পেমেন্টের তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।");
      } else {
        setPayments((data || []) as Payment[]);
      }

      setLoading(false);
    }

    loadPayments();

    return () => {
      cancelled = true;
    };
  }, [supabase, month, year]);

  const classes = useMemo(
    () => Array.from(new Set(students.map((s) => s.class_name))),
    [students]
  );

  const rows: Row[] = useMemo(() => {
    return students.map((student) => {
      const studentPayments = payments
        .filter((p) => p.student_id === student.id)
        .sort((a, b) =>
          b.payment_date.localeCompare(a.payment_date)
        );

      const payable = Math.max(
        0,
        Number(student.monthly_fee || 0) -
          Number(student.discount || 0)
      );

      const paid = studentPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

      // বকেয়া কখনো ঋণাত্মক হবে না।
      const due = Math.max(0, payable - paid);

      let status: Status;

      if (paid >= payable) {
        status = "paid";
      } else if (paid <= 0) {
        status = "unpaid";
      } else {
        status = "partial";
      }

      return {
        student,
        payable,
        paid,
        due,
        status,
        payments: studentPayments,
        lastPaymentDate: studentPayments[0]?.payment_date || null,
        lastReceiptNo: studentPayments[0]?.receipt_no || null,
      };
    });
  }, [students, payments]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      paid: rows.filter((r) => r.status === "paid").length,
      unpaid: rows.filter((r) => r.status === "unpaid").length,
      partial: rows.filter((r) => r.status === "partial").length,
    }),
    [rows]
  );

  const totals = useMemo(
    () => ({
      payable: rows.reduce((sum, r) => sum + r.payable, 0),
      paid: rows.reduce((sum, r) => sum + r.paid, 0),
      due: rows.reduce((sum, r) => sum + r.due, 0),
    }),
    [rows]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((r) => {
      if (
        classFilter &&
        r.student.class_name !== classFilter
      ) {
        return false;
      }

      if (
        statusFilter === "paid" &&
        r.status !== "paid"
      ) {
        return false;
      }

      if (
        statusFilter === "unpaid" &&
        r.status === "paid"
      ) {
        return false;
      }

      if (
        statusFilter === "partial" &&
        r.status !== "partial"
      ) {
        return false;
      }

      if (query) {
        const match = [
          r.student.name,
          r.student.student_id || "",
          r.student.roll || "",
        ].some((value) =>
          value.toLowerCase().includes(query)
        );

        if (!match) return false;
      }

      // তারিখের ফিল্টার পেমেন্ট থাকা শিক্ষার্থীর
      // সর্বশেষ জমার তারিখ যাচাই করে।
      // জমা না দেওয়া শিক্ষার্থীকে তারিখের কারণে বাদ দেওয়া হবে না।
      if (r.lastPaymentDate) {
        if (dateFrom && r.lastPaymentDate < dateFrom) {
          return false;
        }

        if (dateTo && r.lastPaymentDate > dateTo) {
          return false;
        }
      }

      return true;
    });
  }, [
    rows,
    classFilter,
    statusFilter,
    search,
    dateFrom,
    dateTo,
  ]);

  const filterLabel =
    FILTERS.find((f) => f.id === statusFilter)?.label ||
    "সব শিক্ষার্থী";

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <section className="no-print" style={panel}>
        <div style={summaryGrid}>
          <Summary label="মোট শিক্ষার্থী" value={counts.all} />
          <Summary label="Paid" value={counts.paid} color="#15803d" />
          <Summary label="Unpaid" value={counts.unpaid} color="#b91c1c" />
          <Summary label="Partial" value={counts.partial} color="#b45309" />
          <Summary label="মোট প্রাপ্য" value={totals.payable} />
          <Summary label="মোট আদায়" value={totals.paid} color="#15803d" />
          <Summary label="মোট বকেয়া" value={totals.due} color="#b91c1c" />
        </div>
      </section>

      <section className="no-print" style={panel}>
        <div style={filtersGrid}>
          <Field label="মাস">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={input}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </Field>

          <Field label="বছর">
            <input
              type="number"
              min={2020}
              max={2100}
              value={year}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 2020 && value <= 2100) {
                  setYear(value);
                }
              }}
              style={input}
            />
          </Field>

          <Field label="শ্রেণি">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              style={input}
            >
              <option value="">সব শ্রেণি</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="শিক্ষার্থী খুঁজুন">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম / আইডি / রোল"
              style={input}
            />
          </Field>

          <Field label="তারিখ থেকে">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={input}
            />
          </Field>

          <Field label="তারিখ পর্যন্ত">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={input}
            />
          </Field>
        </div>
      </section>

      <section className="no-print" style={panel}>
        <h3 style={sectionTitle}>আলাদা তালিকা</h3>

        <div style={tabList}>
          {FILTERS.map((filter) => {
            const active = statusFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setStatusFilter(filter.id)}
                aria-pressed={active}
                style={{
                  ...tabButton,
                  background: active ? "#0f766e" : "#ffffff",
                  color: active ? "#ffffff" : "#334155",
                  borderColor: active ? "#0f766e" : "#cbd5e1",
                }}
              >
                {filter.label}
                <span style={countBadge}>{counts[filter.id]}</span>
              </button>
            );
          })}
        </div>

        <div style={listHeader}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem" }}>
              {filterLabel}
            </h3>
            <p style={muted}>
              {MONTHS[month - 1]} {year} · {filtered.length} জন
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            style={printButton}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <path d="M6 14h12v8H6z" />
            </svg>
            PDF / Print
          </button>
        </div>
      </section>

      <div className="print-only" style={{ display: "none" }}>
        <h2 style={{ textAlign: "center", marginBottom: 4 }}>
          দারুল হিকমাহ মডেল মাদ্রাসা
        </h2>
        <p style={{ textAlign: "center", margin: "0 0 8px" }}>
          ফুলপুর, ময়মনসিংহ
        </p>
        <h3 style={{ textAlign: "center" }}>
          {MONTHS[month - 1]} {year} — {filterLabel}
        </h3>
      </div>

      {loading ? (
        <div style={messageBox}>পেমেন্টের তথ্য লোড হচ্ছে...</div>
      ) : error ? (
        <div role="alert" style={{ ...messageBox, color: "#b91c1c" }}>
          {error}
          <button
            type="button"
            style={smallButton}
            onClick={() => {
              setMonth((m) => m === 12 ? 11 : m + 1);
              setTimeout(() => setMonth((m) => m === 12 ? 1 : m), 0);
            }}
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={messageBox}>
          এই তালিকায় কোনো শিক্ষার্থী পাওয়া যায়নি।
        </div>
      ) : (
        <section className="student-list">
          {filtered.map((r) => (
            <article key={r.student.id} style={studentCard}>
              <div style={studentHeading}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={studentName}>{r.student.name}</h3>
                  <p style={muted}>
                    আইডি: {r.student.student_id || "—"}
                    {" · "}রোল: {r.student.roll || "—"}
                  </p>
                  <p style={muted}>
                    {r.student.class_name}
                    {r.student.section ? ` · ${r.student.section}` : ""}
                  </p>
                </div>

                <span style={statusStyle(r.status)}>
                  {r.status === "paid"
                    ? "Paid"
                    : r.status === "unpaid"
                    ? "Unpaid"
                    : "Partial"}
                </span>
              </div>

              <div style={amountGrid}>
                <Amount label="নির্ধারিত ফি" value={r.payable} />
                <Amount label="জমা" value={r.paid} color="#15803d" />
                <Amount label="বকেয়া" value={r.due} color={r.due > 0 ? "#b91c1c" : "#475569"} />
              </div>

              <div style={paymentInfo}>
                <span>শেষ জমা: {r.lastPaymentDate || "জমা নেই"}</span>
                <span>রসিদ: {r.lastReceiptNo || "—"}</span>
              </div>

              <div className="no-print" style={{ marginTop: 10 }}>
                <button
                  type="button"
                  style={smallButton}
                  onClick={() => setDetailStudent(r.student)}
                >
                  পেমেন্টের বিস্তারিত
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {detailStudent && (
        <StudentDetailModal
          student={detailStudent}
          payments={payments.filter(
            (p) => p.student_id === detailStudent.id
          )}
          month={month}
          year={year}
          onClose={() => setDetailStudent(null)}
        />
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          body {
            background: #fff !important;
            color: #111 !important;
          }

          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          .student-list {
            display: block !important;
          }

          .student-list article {
            box-shadow: none !important;
            break-inside: avoid;
            border: 1px solid #bbb !important;
            margin-bottom: 8px !important;
          }
        }
      `}</style>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", fontSize: "0.8rem", color: "#475569" }}>
      <span style={{ display: "block", marginBottom: 5 }}>{label}</span>
      {children}
    </label>
  );
}

function Summary({
  label,
  value,
  color = "#1e293b",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div style={{ ...summaryCard, borderTop: `3px solid ${color}` }}>
      <div style={muted}>{label}</div>
      <strong style={{ fontSize: "1.1rem", color }}>
        {label.includes("শিক্ষার্থী") || ["Paid", "Unpaid", "Partial"].includes(label)
          ? value.toLocaleString("bn-BD")
          : money(value)}
      </strong>
    </div>
  );
}

function Amount({
  label,
  value,
  color = "#334155",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={muted}>{label}</div>
      <strong style={{ color, fontSize: "0.92rem" }}>
        {money(value)}
      </strong>
    </div>
  );
}

function statusStyle(status: Status): CSSProperties {
  const colors = {
    paid: { color: "#166534", background: "#dcfce7" },
    unpaid: { color: "#991b1b", background: "#fee2e2" },
    partial: { color: "#92400e", background: "#fef3c7" },
  };

  return {
    ...colors[status],
    borderRadius: 5,
    padding: "4px 8px",
    fontSize: "0.76rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
}

const panel: CSSProperties = {
  background: "#fff",
  padding: "14px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  marginBottom: 12,
};

const summaryGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))",
  gap: 9,
};

const summaryCard: CSSProperties = {
  padding: "10px",
  background: "#f8fafc",
  borderRadius: 7,
  display: "grid",
  gap: 5,
};

const filtersGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
  gap: 12,
};

const input: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
  padding: "8px 9px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  background: "#fff",
  fontSize: "0.85rem",
};

const sectionTitle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: "1rem",
};

const tabList: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginBottom: 16,
};

const tabButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "7px 9px",
  border: "1px solid",
  borderRadius: 6,
  fontSize: "0.78rem",
  cursor: "pointer",
};

const countBadge: CSSProperties = {
  fontSize: "0.72rem",
  fontWeight: 600,
};

const listHeader: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  borderTop: "1px solid #e2e8f0",
  paddingTop: 12,
};

const printButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "7px 10px",
  border: 0,
  borderRadius: 6,
  background: "#0f766e",
  color: "#fff",
  fontSize: "0.8rem",
  cursor: "pointer",
};

const studentCard: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  padding: 13,
  marginBottom: 9,
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
};

const studentHeading: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
};

const studentName: CSSProperties = {
  margin: "0 0 5px",
  fontSize: "0.98rem",
  fontWeight: 600,
  color: "#0f172a",
};

const muted: CSSProperties = {
  margin: "3px 0",
  fontSize: "0.77rem",
  color: "#64748b",
};

const amountGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
  padding: "12px 0",
  marginTop: 9,
  borderTop: "1px solid #f1f5f9",
  borderBottom: "1px solid #f1f5f9",
};

const paymentInfo: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px 16px",
  fontSize: "0.75rem",
  color: "#64748b",
};

const messageBox: CSSProperties = {
  padding: 22,
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  textAlign: "center",
  color: "#64748b",
};

const smallButton: CSSProperties = {
  padding: "6px 9px",
  border: "1px solid #0f766e",
  borderRadius: 5,
  background: "#fff",
  color: "#0f766e",
  fontSize: "0.78rem",
  cursor: "pointer",
};
