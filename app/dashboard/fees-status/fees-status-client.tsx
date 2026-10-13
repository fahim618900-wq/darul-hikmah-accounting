
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
  lastPaymentDate: string | null;
  lastReceiptNo: string | null;
  payments: Payment[];
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল",
  "মে", "জুন", "জুলাই", "আগস্ট",
  "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "unpaid", label: "Unpaid" },
  { id: "partial", label: "Partial" },
];

const money = (n: number) =>
  `৳ ${n.toLocaleString("bn-BD")}`;

function today() {
  return new Date().toLocaleDateString("en-GB", {
    timeZone: "Asia/Dhaka",
  });
}

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
  const [preparedBy, setPreparedBy] = useState("");
  const [reportDate, setReportDate] = useState(today());
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
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
        setError("পেমেন্টের তথ্য পাওয়া যায়নি। আবার চেষ্টা করুন।");
      } else {
        setPayments((data || []) as Payment[]);
      }

      setLoading(false);
    }

    loadPayments();

    return () => {
      cancelled = true;
    };
  }, [supabase, month, year, reloadKey]);

  const classes = useMemo(
    () => [...new Set(students.map((s) => s.class_name))],
    [students]
  );

  const rows: Row[] = useMemo(() => {
    return students.map((student) => {
      const history = payments
        .filter((p) => p.student_id === student.id)
        .sort((a, b) =>
          b.payment_date.localeCompare(a.payment_date)
        );

      const payable = Math.max(
        0,
        Number(student.monthly_fee || 0) -
          Number(student.discount || 0)
      );

      const paid = history.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );

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
        lastPaymentDate: history[0]?.payment_date || null,
        lastReceiptNo: history[0]?.receipt_no || null,
        payments: history,
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((r) => {
      if (classFilter && r.student.class_name !== classFilter) {
        return false;
      }

      if (statusFilter === "paid" && r.status !== "paid") {
        return false;
      }

      // Unpaid তালিকায় সম্পূর্ণ বকেয়া ও আংশিক বকেয়া দুটিই থাকবে।
      if (statusFilter === "unpaid" && r.status === "paid") {
        return false;
      }

      if (statusFilter === "partial" && r.status !== "partial") {
        return false;
      }

      if (q) {
        const found = [
          r.student.name,
          r.student.student_id || "",
          r.student.roll || "",
        ].some((value) => value.toLowerCase().includes(q));

        if (!found) return false;
      }

      // তারিখ ফিল্টার: সর্বশেষ জমার তারিখ।
      if (dateFrom && (!r.lastPaymentDate ||
          r.lastPaymentDate < dateFrom)) return false;

      if (dateTo && (!r.lastPaymentDate ||
          r.lastPaymentDate > dateTo)) return false;

      return true;
    });
  }, [rows, classFilter, statusFilter, search, dateFrom, dateTo]);

  const totals = useMemo(
    () => ({
      payable: filtered.reduce((s, r) => s + r.payable, 0),
      paid: filtered.reduce((s, r) => s + r.paid, 0),
      due: filtered.reduce((s, r) => s + r.due, 0),
    }),
    [filtered]
  );

  const selectedLabel =
    FILTERS.find((f) => f.id === statusFilter)?.label || "All";

  function printReport() {
    setReportDate(today());
    window.print();
  }

  return (
    <>
      {/* অ্যাপের ফিল্টার ও নিয়ন্ত্রণ */}
      <section className="no-print" style={panel}>
        <div style={summaryGrid}>
          <Summary label="মোট শিক্ষার্থী" value={counts.all} />
          <Summary label="Paid" value={counts.paid} />
          <Summary label="Unpaid" value={counts.unpaid} />
          <Summary label="Partial" value={counts.partial} />
        </div>

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

          <Field label="খুঁজুন">
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

          <Field label="প্রস্তুতকারীর নাম">
            <input
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="আপনার নাম"
              style={input}
            />
          </Field>
        </div>

        <div style={tabs}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              aria-pressed={statusFilter === f.id}
              style={{
                ...tab,
                background: statusFilter === f.id ? "#0f766e" : "#fff",
                color: statusFilter === f.id ? "#fff" : "#334155",
                borderColor: statusFilter === f.id ? "#0f766e" : "#cbd5e1",
              }}
            >
              {f.label} ({counts[f.id]})
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={printReport}
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
      </section>

      {loading ? (
        <div style={message}>লোড হচ্ছে...</div>
      ) : error ? (
        <div style={message} role="alert">
          {error}
          <button
            type="button"
            style={retryButton}
            onClick={() => setReloadKey((key) => key + 1)}
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : (
        <>
          {/* এই অংশ অ্যাপ ও প্রিন্ট উভয় জায়গায় টেবিল হিসেবে থাকবে */}
          <section className="report-sheet">
            <header className="report-heading">
              <h1>দারুল হিকমাহ মডেল মাদরাসা</h1>
              <p>
                বিষয় : {selectedLabel} তালিকা
              </p>
              <p>
                মাস ও বছর: {MONTHS[month - 1]} {year}
              </p>
              <p className="report-meta">
                <span>তারিখ: {reportDate}</span>
                <span>প্রস্তুতকারীর নাম: {preparedBy || "________________"}</span>
              </p>
              <div className="report-rule" />
            </header>

            <div className="table-scroll">
              <table className="excel-table">
                <thead>
                  <tr>
                    <th>নং</th>
                    <th>শিক্ষার্থী আইডি</th>
                    <th>শিক্ষার্থীর নাম</th>
                    <th>শ্রেণি</th>
                    <th>শাখা</th>
                    <th>রোল</th>
                    <th>নির্ধারিত ফি</th>
                    <th>জমা</th>
                    <th>বকেয়া</th>
                    <th>স্ট্যাটাস</th>
                    <th>শেষ জমার তারিখ</th>
                    <th>রসিদ নম্বর</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((r, index) => (
                    <tr key={r.student.id}>
                      <td>{(index + 1).toLocaleString("bn-BD")}</td>
                      <td>{r.student.student_id || "—"}</td>
                      <td className="student-name-cell">
                        {r.student.name}
                      </td>
                      <td>{r.student.class_name}</td>
                      <td>{r.student.section || "—"}</td>
                      <td>{r.student.roll || "—"}</td>
                      <td className="number-cell">{money(r.payable)}</td>
                      <td className="number-cell">{money(r.paid)}</td>
                      <td className="number-cell">{money(r.due)}</td>
                      <td>
                        {r.status === "paid"
                          ? "Paid"
                          : r.status === "unpaid"
                          ? "Unpaid"
                          : "Partial"}
                      </td>
                      <td>{r.lastPaymentDate || "—"}</td>
                      <td>{r.lastReceiptNo || "—"}</td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={12} style={{ textAlign: "center" }}>
                        কোনো তথ্য পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <th colSpan={6}>মোট ({filtered.length} জন)</th>
                    <th>{money(totals.payable)}</th>
                    <th>{money(totals.paid)}</th>
                    <th>{money(totals.due)}</th>
                    <th colSpan={3}></th>
                  </tr>
                </tfoot>
              </table>
            </div>

            <footer className="report-footer">
              <span>মোট শিক্ষার্থী: {filtered.length.toLocaleString("bn-BD")} জন</span>
              <span>মোট প্রাপ্য: {money(totals.payable)}</span>
              <span>মোট আদায়: {money(totals.paid)}</span>
              <span>মোট বকেয়া: {money(totals.due)}</span>
            </footer>

            <div className="report-signatures">
              <span>প্রস্তুতকারীর স্বাক্ষর: ______________</span>
              <span>অনুমোদনকারীর স্বাক্ষর: ______________</span>
            </div>
          </section>

          {/* শুধু অ্যাপে বিস্তারিত বাটন */}
          <section className="no-print" style={{ marginTop: 12 }}>
            <h3 style={{ fontSize: "0.95rem" }}>
              শিক্ষার্থীর বিস্তারিত
            </h3>
            <div style={detailList}>
              {filtered.map((r) => (
                <div key={r.student.id} style={detailRow}>
                  <div style={{ minWidth: 0 }}>
                    <strong>{r.student.name}</strong>
                    <div style={muted}>
                      {r.student.class_name} · রোল {r.student.roll || "—"}
                    </div>
                  </div>
                  <button
                    type="button"
                    style={smallButton}
                    onClick={() => setDetailStudent(r.student)}
                  >
                    বিস্তারিত
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
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
        .report-sheet {
          background: #fff;
          color: #111;
          border: 1px solid #d1d5db;
          padding: 14px;
          border-radius: 5px;
          width: 100%;
          box-sizing: border-box;
        }

        .report-heading {
          text-align: center;
          font-family: inherit;
        }

        .report-heading h1 {
          font-size: 21px;
          margin: 0 0 5px;
          font-weight: 700;
        }

        .report-heading p {
          margin: 3px 0;
          font-size: 12px;
        }

        .report-meta {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 9px !important;
          text-align: left;
        }

        .report-rule {
          height: 1px;
          background: #6b7280;
          margin: 9px 0 13px;
        }

        .table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        .excel-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          background: #fff;
        }

        .excel-table th,
        .excel-table td {
          border: 1px solid #9ca3af;
          padding: 7px 5px;
          text-align: left;
          vertical-align: middle;
          overflow-wrap: anywhere;
        }

        .excel-table thead th {
          background: #e5e7eb;
          color: #111827;
          font-weight: 700;
          text-align: center;
        }

        .excel-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }

        .excel-table .student-name-cell {
          font-weight: 500;
          min-width: 90px;
        }

        .excel-table .number-cell {
          text-align: right;
          white-space: nowrap;
        }

        .excel-table tfoot th {
          background: #f3f4f6;
          font-weight: 700;
        }

        .report-footer {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 18px;
          padding-top: 10px;
          font-size: 11px;
          font-weight: 600;
        }

        .report-signatures {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 40px;
          font-size: 11px;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          html,
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          .report-sheet,
          .report-sheet * {
            visibility: visible;
          }

          .report-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none;
            padding: 0;
            border: none;
            border-radius: 0;
            margin: 0;
            box-shadow: none;
          }

          .report-heading h1 {
            font-size: 19px;
          }

          .report-heading p,
          .report-meta,
          .report-footer,
          .report-signatures {
            font-size: 10px !important;
          }

          .table-scroll {
            overflow: visible;
          }

          .excel-table {
            width: 100%;
            table-layout: auto;
            font-size: 8px;
          }

          .excel-table th,
          .excel-table td {
            padding: 4px 3px;
            overflow-wrap: anywhere;
          }

          .excel-table thead {
            display: table-header-group;
          }

          .excel-table tfoot {
            display: table-row-group;
          }

          .excel-table tr {
            break-inside: avoid;
          }

          .report-signatures {
            margin-top: 25px;
          }

          .report-sheet,
          .excel-table,
          .excel-table tr {
            break-inside: auto;
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
    <label style={{ fontSize: "0.8rem", color: "#475569" }}>
      <span style={{ display: "block", marginBottom: 5 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={summaryCard}>
      <span style={muted}>{label}</span>
      <strong>{value.toLocaleString("bn-BD")} জন</strong>
    </div>
  );
}

const panel: CSSProperties = {
  background: "#fff",
  padding: 13,
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  marginBottom: 12,
};

const summaryGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
  gap: 8,
  marginBottom: 14,
};

const summaryCard: CSSProperties = {
  display: "grid",
  gap: 5,
  padding: 10,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  fontSize: "0.85rem",
};

const filtersGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))",
  gap: 11,
};

const input: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "7px 8px",
  border: "1px solid #cbd5e1",
  borderRadius: 5,
  background: "#fff",
  fontSize: "0.82rem",
};

const tabs: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 13,
};

const tab: CSSProperties = {
  padding: "6px 10px",
  border: "1px solid",
  borderRadius: 5,
  fontSize: "0.78rem",
  cursor: "pointer",
};

const printButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 11px",
  marginTop: 12,
  background: "#0f766e",
  color: "#fff",
  border: 0,
  borderRadius: 5,
  fontSize: "0.8rem",
  cursor: "pointer",
};

const message: CSSProperties = {
  background: "#fff",
  padding: 20,
  borderRadius: 7,
  textAlign: "center",
  color: "#475569",
};

const retryButton: CSSProperties = {
  display: "block",
  margin: "12px auto 0",
  padding: "6px 10px",
  background: "#fff",
  border: "1px solid #cbd5e1",
  borderRadius: 5,
  fontSize: "0.8rem",
};

const detailList: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 7,
  padding: "0 10px",
};

const detailRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: "10px 0",
  borderBottom: "1px solid #f1f5f9",
  fontSize: "0.84rem",
};

const muted: CSSProperties = {
  margin: "3px 0",
  color: "#64748b",
  fontSize: "0.76rem",
};

const smallButton: CSSProperties = {
  padding: "5px 8px",
  border: "1px solid #0f766e",
  borderRadius: 5,
  background: "#fff",
  color: "#0f766e",
  fontSize: "0.76rem",
  cursor: "pointer",
};
