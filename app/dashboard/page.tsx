import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function formatTaka(amount: number) {
  return "৳ " + amount.toLocaleString("bn-BD");
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  /* --- সব ডেটা (আগের মতোই) --- */
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("is_deleted", false);

  const { data: students } = await supabase
    .from("students")
    .select("id, name, class_name, monthly_fee, discount")
    .eq("status", "active")
    .eq("is_deleted", false);

  const totalPayable =
    students?.reduce(
      (sum, s) =>
        sum + Number(s.monthly_fee || 0) - Number(s.discount || 0),
      0
    ) || 0;

  const { data: payments } = await supabase
    .from("fee_payments")
    .select("id, student_id, amount, payment_date, receipt_no")
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  const totalCollected =
    payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

  const totalDue = totalPayable - totalCollected;

  const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const monthEnd = new Date(currentYear, currentMonth, 0)
    .toISOString()
    .split("T")[0];

  const { data: incomes } = await supabase
    .from("incomes")
    .select("amount")
    .gte("entry_date", monthStart)
    .lte("entry_date", monthEnd)
    .eq("is_deleted", false);

  const totalIncome =
    incomes?.reduce((sum, i) => sum + Number(i.amount || 0), 0) || 0;

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount")
    .gte("entry_date", monthStart)
    .lte("entry_date", monthEnd)
    .eq("is_deleted", false);

  const totalExpense =
    expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;

  const paidStudentIds = new Set<number>();
  payments?.forEach((p) => p.student_id && paidStudentIds.add(p.student_id));
  const paidCount = paidStudentIds.size;
  const unpaidCount = (studentCount || 0) - paidCount;

  /* --- শ্রেণিভিত্তিক --- */
  const classMap = new Map<string, { total: number; paid: number }>();
  students?.forEach((s) => {
    const cn = s.class_name || "—";
    if (!classMap.has(cn)) classMap.set(cn, { total: 0, paid: 0 });
    const e = classMap.get(cn)!;
    e.total += 1;
    if (paidStudentIds.has(s.id)) e.paid += 1;
  });
  const classStats = Array.from(classMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], "bn")
  );

  /* --- সাম্প্রতিক --- */
  const studentNameMap = new Map<number, string>();
  students?.forEach((s) => studentNameMap.set(s.id, s.name));
  const recent = (payments || []).slice(0, 5).map((p) => ({
    id: p.id,
    name: p.student_id ? studentNameMap.get(p.student_id) || "—" : "—",
    amount: Number(p.amount || 0),
    date: p.payment_date,
  }));

  /* --- বকেয়া --- */
  const dueMap = new Map<number, number>();
  students?.forEach((s) => {
    const payable = Number(s.monthly_fee || 0) - Number(s.discount || 0);
    dueMap.set(s.id, payable);
  });
  payments?.forEach((p) => {
    if (!p.student_id) return;
    dueMap.set(p.student_id, (dueMap.get(p.student_id) || 0) - Number(p.amount || 0));
  });
  const dueStudents = Array.from(dueMap.entries())
    .filter(([, d]) => d > 0)
    .map(([id, due]) => ({
      id,
      name: studentNameMap.get(id) || "—",
      due,
    }))
    .sort((a, b) => b.due - a.due)
    .slice(0, 5);

  const monthName = now.toLocaleString("bn-BD", { month: "long" });

  return (
    <main className="page">
      {/* ============ শিরোনাম ============ */}
      <div className="page-head">
        <h1>ড্যাশবোর্ড</h1>
        <p>
          {monthName} {currentYear}
        </p>
      </div>

      {/* ============ সারসংক্ষেপ ============ */}
      <section className="box">
        <h2 className="box-title">সারসংক্ষেপ</h2>
        <div className="rows">
          <div className="row">
            <span>মোট শিক্ষার্থী</span>
            <strong>{studentCount || 0} জন</strong>
          </div>
          <div className="row">
            <span>চলতি মাসের প্রাপ্য বেতন</span>
            <strong>{formatTaka(totalPayable)}</strong>
          </div>
          <div className="row">
            <span>চলতি মাসে আদায়</span>
            <strong className="green">{formatTaka(totalCollected)}</strong>
          </div>
          <div className="row">
            <span>চলতি মাসের বাকি</span>
            <strong className={totalDue > 0 ? "red" : ""}>
              {formatTaka(totalDue)}
            </strong>
          </div>
          <div className="row">
            <span>মোট আয় (চলতি মাস)</span>
            <strong>{formatTaka(totalIncome)}</strong>
          </div>
          <div className="row">
            <span>মোট ব্যয় (চলতি মাস)</span>
            <strong>{formatTaka(totalExpense)}</strong>
          </div>
          <div className="row row-total">
            <span>ব্যালেন্স</span>
            <strong>{formatTaka(totalIncome + totalCollected - totalExpense)}</strong>
          </div>
          <div className="row">
            <span>Paid / Unpaid</span>
            <strong>
              <span className="green">{paidCount}</span> / {unpaidCount} জন
            </strong>
          </div>
        </div>
      </section>

      {/* ============ শ্রেণিভিত্তিক ============ */}
      <section className="box">
        <h2 className="box-title">শ্রেণিভিত্তিক শিক্ষার্থী</h2>
        {classStats.length === 0 ? (
          <p className="empty">কোনো তথ্য নেই</p>
        ) : (
          <div className="rows">
            {classStats.map(([name, s]) => (
              <div key={name} className="row">
                <span>{name}</span>
                <strong>
                  {s.total} জন{" "}
                  <span className="muted">· Paid {s.paid}</span>
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============ সাম্প্রতিক আদায় ============ */}
      <section className="box">
        <h2 className="box-title">সাম্প্রতিক বেতন আদায়</h2>
        {recent.length === 0 ? (
          <p className="empty">এই মাসে কোনো আদায় হয়নি</p>
        ) : (
          <div className="rows">
            {recent.map((p) => (
              <div key={p.id} className="row">
                <span>{p.name}</span>
                <strong className="green">{formatTaka(p.amount)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============ বকেয়া ============ */}
      <section className="box">
        <h2 className="box-title">বকেয়া শিক্ষার্থী</h2>
        {dueStudents.length === 0 ? (
          <p className="empty">কারো বকেয়া নেই</p>
        ) : (
          <div className="rows">
            {dueStudents.map((s) => (
              <div key={s.id} className="row">
                <span>{s.name}</span>
                <strong className="red">{formatTaka(s.due)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============ লিংক ============ */}
      <div className="links">
        <Link href="/dashboard/students">শিক্ষার্থী</Link>
        <Link href="/dashboard/fees">বেতন আদায়</Link>
        <Link href="/dashboard/income">আয়</Link>
        <Link href="/dashboard/expenses">ব্যয়</Link>
        <Link href="/dashboard/reports">রিপোর্ট</Link>
      </div>

      {/* ============ Styles ============ */}
      <style>{`
        .page {
          max-width: 720px;
          margin: 0 auto;
          padding: 1.5rem 1rem 3rem;
          font-family: inherit;
          color: #111827;
        }

        /* শিরোনাম */
        .page-head {
          margin-bottom: 1.5rem;
        }
        .page-head h1 {
          font-size: 1.35rem;
          font-weight: 700;
          margin: 0 0 0.15rem;
          color: #111827;
        }
        .page-head p {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
        }

        /* বক্স */
        .box {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 1rem 1.1rem;
          margin-bottom: 1rem;
          background: #ffffff;
        }
        .box-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0 0 0.75rem;
        }

        /* সারি */
        .rows {
          display: flex;
          flex-direction: column;
        }
        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.65rem 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.9rem;
        }
        .row:last-child {
          border-bottom: none;
        }
        .row span {
          color: #4b5563;
        }
        .row strong {
          font-weight: 600;
          color: #111827;
          text-align: right;
        }
        .row-total {
          border-top: 1px solid #e5e7eb;
          border-bottom: none;
          margin-top: 0.25rem;
          padding-top: 0.85rem;
        }
        .row-total span {
          color: #111827;
          font-weight: 600;
        }
        .row-total strong {
          font-size: 1rem;
        }

        /* রঙ */
        .green { color: #15803d; }
        .red { color: #b91c1c; }
        .muted {
          color: #9ca3af;
          font-weight: 400;
          font-size: 0.82rem;
        }

        /* empty */
        .empty {
          color: #9ca3af;
          font-size: 0.85rem;
          margin: 0.5rem 0;
        }

        /* লিংক */
        .links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding-top: 0.5rem;
        }
        .links a {
          font-size: 0.85rem;
          color: #0f766e;
          text-decoration: none;
          padding: 0.45rem 0.85rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #ffffff;
        }
        .links a:hover {
          border-color: #0f766e;
          background: #f0fdfa;
        }

        /* Dark */
        .dark .page { color: #e5e7eb; }
        .dark .page-head h1 { color: #f9fafb; }
        .dark .page-head p { color: #9ca3af; }
        .dark .box {
          background: #111827;
          border-color: #1f2937;
        }
        .dark .box-title { color: #9ca3af; }
        .dark .row { border-bottom-color: #1f2937; }
        .dark .row span { color: #9ca3af; }
        .dark .row strong { color: #f9fafb; }
        .dark .row-total { border-top-color: #1f2937; }
        .dark .row-total span { color: #f9fafb; }
        .dark .green { color: #4ade80; }
        .dark .red { color: #f87171; }
        .dark .muted { color: #6b7280; }
        .dark .empty { color: #6b7280; }
        .dark .links a {
          background: #111827;
          border-color: #374151;
          color: #5eead4;
        }
        .dark .links a:hover {
          border-color: #5eead4;
          background: #0f172a;
        }
      `}</style>
    </main>
  );
}
