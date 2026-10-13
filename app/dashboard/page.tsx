import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

/* ==================== Helpers ==================== */
function formatTaka(amount: number) {
  return "৳ " + amount.toLocaleString("bn-BD");
}

function formatDateBn(date: Date) {
  return date.toLocaleDateString("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDateBn(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" });
}

/* ==================== SVG Icons ==================== */
type IconProps = { size?: number; className?: string };

const StudentsIcon = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PayableIcon = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="15" x2="10" y2="15" />
  </svg>
);

const CollectedIcon = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12l3 3 5-6" />
  </svg>
);

const DueIcon = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="16" r="0.6" fill="currentColor" />
  </svg>
);

const IncomeIcon = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="15 7 21 7 21 13" />
  </svg>
);

const ExpenseIcon = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 7 9 13 13 9 21 17" />
    <polyline points="15 17 21 17 21 11" />
  </svg>
);

const BalanceIcon = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3v18" />
    <path d="M5 7h14" />
    <path d="M5 7l-3 6a3 3 0 0 0 6 0z" />
    <path d="M19 7l-3 6a3 3 0 0 0 6 0z" />
  </svg>
);

const PaidIcon = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const ArrowRightIcon = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const CalendarIcon = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </svg>
);

const ClassIcon = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const ReceiptIcon = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
    <path d="M8 7h8M8 11h8M8 15h5" />
  </svg>
);

const AlertIcon = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const UserPlusIcon = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

/* ==================== Page ==================== */
export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  /* ---------- Students count ---------- */
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("is_deleted", false);

  /* ---------- Students with details for aggregation ---------- */
  const { data: students } = await supabase
    .from("students")
    .select("id, name, class_name, monthly_fee, discount, admission_date, created_at")
    .eq("status", "active")
    .eq("is_deleted", false);

  const totalPayable =
    students?.reduce((sum, s) => {
      const fee = Number(s.monthly_fee || 0);
      const discount = Number(s.discount || 0);
      return sum + (fee - discount);
    }, 0) || 0;

  /* ---------- Current month payments ---------- */
  const { data: payments } = await supabase
    .from("fee_payments")
    .select("id, student_id, amount, payment_date, receipt_no, payment_method, created_at")
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  const totalCollected =
    payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

  const totalDue = totalPayable - totalCollected;

  /* ---------- Month range ---------- */
  const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const monthEnd = new Date(currentYear, currentMonth, 0)
    .toISOString()
    .split("T")[0];

  /* ---------- Income ---------- */
  const { data: incomes } = await supabase
    .from("incomes")
    .select("amount")
    .gte("entry_date", monthStart)
    .lte("entry_date", monthEnd)
    .eq("is_deleted", false);

  const totalIncome =
    incomes?.reduce((sum, i) => sum + Number(i.amount || 0), 0) || 0;

  /* ---------- Expense ---------- */
  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount")
    .gte("entry_date", monthStart)
    .lte("entry_date", monthEnd)
    .eq("is_deleted", false);

  const totalExpense =
    expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;

  const balance = totalIncome + totalCollected - totalExpense;

  /* ---------- Paid / Unpaid counts ---------- */
  const paidStudentIds = new Set<number>();
  payments?.forEach((p) => p.student_id && paidStudentIds.add(p.student_id));
  const paidCount = paidStudentIds.size;
  const unpaidCount = (studentCount || 0) - paidCount;

  /* ---------- Class-wise aggregation ---------- */
  type ClassStat = {
    class_name: string;
    total: number;
    paid: number;
    payable: number;
    collected: number;
  };

  const classMap = new Map<string, ClassStat>();
  students?.forEach((s) => {
    const cn = s.class_name || "অজানা";
    if (!classMap.has(cn)) {
      classMap.set(cn, {
        class_name: cn,
        total: 0,
        paid: 0,
        payable: 0,
        collected: 0,
      });
    }
    const entry = classMap.get(cn)!;
    entry.total += 1;
    entry.payable +=
      Number(s.monthly_fee || 0) - Number(s.discount || 0);
    if (paidStudentIds.has(s.id)) entry.paid += 1;
  });

  /* Collected amount per class */
  const studentClassMap = new Map<number, string>();
  students?.forEach((s) => {
    studentClassMap.set(s.id, s.class_name || "অজানা");
  });
  payments?.forEach((p) => {
    if (!p.student_id) return;
    const cn = studentClassMap.get(p.student_id);
    if (!cn) return;
    const entry = classMap.get(cn);
    if (entry) entry.collected += Number(p.amount || 0);
  });

  const classStats = Array.from(classMap.values()).sort((a, b) =>
    a.class_name.localeCompare(b.class_name, "bn")
  );

  /* ---------- Recent payments (top 5) ---------- */
  const studentNameMap = new Map<number, string>();
  students?.forEach((s) => studentNameMap.set(s.id, s.name));

  const recentPayments = (payments || [])
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      studentName: p.student_id
        ? studentNameMap.get(p.student_id) || "—"
        : "—",
      amount: Number(p.amount || 0),
      date: p.payment_date,
      receipt: p.receipt_no,
    }));

  /* ---------- Top 5 due students ---------- */
  const dueByStudent = new Map<number, number>();
  students?.forEach((s) => {
    const payable = Number(s.monthly_fee || 0) - Number(s.discount || 0);
    dueByStudent.set(s.id, payable);
  });
  payments?.forEach((p) => {
    if (!p.student_id) return;
    const prev = dueByStudent.get(p.student_id) || 0;
    dueByStudent.set(p.student_id, prev - Number(p.amount || 0));
  });

  const dueStudents = Array.from(dueByStudent.entries())
    .filter(([, due]) => due > 0)
    .map(([id, due]) => ({
      id,
      name: studentNameMap.get(id) || "—",
      className: studentClassMap.get(id) || "",
      due,
    }))
    .sort((a, b) => b.due - a.due)
    .slice(0, 5);

  /* ---------- Admission stats ---------- */
  const monthStartDate = new Date(currentYear, currentMonth - 1, 1);
  const newThisMonth =
    students?.filter((s) => {
      const d = s.admission_date ? new Date(s.admission_date) : null;
      return d && d >= monthStartDate;
    }).length || 0;

  /* ---------- Derived rates ---------- */
  const collectionRate =
    totalPayable > 0 ? Math.round((totalCollected / totalPayable) * 100) : 0;
  const paidRate =
    studentCount && studentCount > 0
      ? Math.round((paidCount / studentCount) * 100)
      : 0;

  const monthName = now.toLocaleString("bn-BD", { month: "long" });
  const formattedDate = formatDateBn(now);

  /* ---------- Stat cards ---------- */
  const stats = [
    { label: "মোট শিক্ষার্থী", value: studentCount || 0, suffix: "জন", href: "/dashboard/students", Icon: StudentsIcon, tone: "teal" },
    { label: "চলতি মাসের প্রাপ্য", value: formatTaka(totalPayable), href: "/dashboard/reports", Icon: PayableIcon, tone: "blue" },
    { label: "চলতি মাসে আদায়", value: formatTaka(totalCollected), href: "/dashboard/reports", Icon: CollectedIcon, tone: "emerald" },
    { label: "চলতি মাসের বাকি", value: formatTaka(totalDue), href: "/dashboard/fees-status", Icon: DueIcon, tone: "rose" },
    { label: "মোট আয় (চলতি মাস)", value: formatTaka(totalIncome), href: "/dashboard/income", Icon: IncomeIcon, tone: "emerald" },
    { label: "মোট ব্যয় (চলতি মাস)", value: formatTaka(totalExpense), href: "/dashboard/expenses", Icon: ExpenseIcon, tone: "rose" },
    { label: "ব্যালেন্স", value: formatTaka(balance), href: "/dashboard/reports", Icon: BalanceIcon, tone: "teal" },
    { label: "Paid / Unpaid", value: `${paidCount} / ${unpaidCount}`, suffix: "জন", href: "/dashboard/fees-status", Icon: PaidIcon, tone: "violet" },
  ];

  /* ---------- Quick Actions ---------- */
  const quickActions = [
    { href: "/dashboard/students", label: "শিক্ষার্থী যোগ", tone: "teal" },
    { href: "/dashboard/fees", label: "বেতন গ্রহণ", tone: "emerald" },
    { href: "/dashboard/income", label: "আয় যোগ", tone: "blue" },
    { href: "/dashboard/expenses", label: "ব্যয় যোগ", tone: "rose" },
    { href: "/dashboard/reports", label: "রিপোর্ট দেখুন", tone: "violet" },
  ];

  /* Max value for bar scaling */
  const maxClassTotal = Math.max(1, ...classStats.map((c) => c.total));

  return (
    <main className="dash-root">
      {/* ==================== Hero Header ==================== */}
      <section className="dash-hero">
        <div className="dash-hero-bg" aria-hidden="true" />
        <div className="dash-hero-content">
          <div className="dash-hero-left">
            <span className="dash-hero-eyebrow">
              <CalendarIcon size={14} />
              {formattedDate}
            </span>
            <h1 className="dash-hero-title">আসসালামু আলাইকুম 👋</h1>
            <p className="dash-hero-sub">
              {monthName} {currentYear} — চলতি মাসের সারসংক্ষেপ
            </p>
          </div>

          <div className="dash-hero-right">
            <div className="dash-hero-metric">
              <div className="dash-hero-metric-label">আদায়ের হার</div>
              <div className="dash-hero-metric-value">{collectionRate}%</div>
            </div>
            <div className="dash-hero-metric">
              <div className="dash-hero-metric-label">Paid শিক্ষার্থী</div>
              <div className="dash-hero-metric-value">{paidRate}%</div>
            </div>
          </div>
        </div>

        <div className="dash-hero-progress">
          <div
            className="dash-hero-progress-fill"
            style={{ width: `${Math.min(collectionRate, 100)}%` }}
          />
        </div>
      </section>

      {/* ==================== Stats Grid ==================== */}
      <section className="dash-section">
        <header className="dash-section-head">
          <h2 className="dash-section-title">আর্থিক সারসংক্ষেপ</h2>
          <p className="dash-section-sub">
            {monthName} {currentYear}
          </p>
        </header>

        <div className="stats-grid">
          {stats.map((stat) => {
            const { Icon } = stat;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className={`stat-card stat-card-${stat.tone}`}
              >
                <div className="stat-icon-wrap">
                  <Icon size={20} />
                </div>
                <div className="stat-body">
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value">
                    {stat.value}
                    {stat.suffix && (
                      <span className="stat-suffix">{stat.suffix}</span>
                    )}
                  </div>
                </div>
                <span className="stat-arrow">
                  <ArrowRightIcon size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ==================== Two-Column Section ==================== */}
      <section className="dash-two-col">
        {/* ---------- Left: Class-wise students ---------- */}
        <div className="dash-card">
          <header className="dash-card-head">
            <div className="dash-card-title">
              <span className="dash-card-title-icon dash-tone-teal">
                <ClassIcon size={16} />
              </span>
              <h3>শ্রেণিভিত্তিক শিক্ষার্থী</h3>
            </div>
            <Link href="/dashboard/students" className="dash-card-link">
              সব দেখুন <ArrowRightIcon size={12} />
            </Link>
          </header>

          {classStats.length === 0 ? (
            <p className="dash-empty">কোনো শিক্ষার্থী নেই।</p>
          ) : (
            <ul className="class-list">
              {classStats.map((c) => {
                const width = Math.round((c.total / maxClassTotal) * 100);
                return (
                  <li key={c.class_name} className="class-row">
                    <div className="class-row-head">
                      <span className="class-row-name">{c.class_name}</span>
                      <span className="class-row-count">
                        {c.total} জন
                      </span>
                    </div>
                    <div className="class-bar">
                      <div
                        className="class-bar-fill"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <div className="class-row-meta">
                      <span className="class-meta-paid">
                        Paid: {c.paid}
                      </span>
                      <span className="class-meta-due">
                        Unpaid: {c.total - c.paid}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ---------- Right: Class-wise collection ---------- */}
        <div className="dash-card">
          <header className="dash-card-head">
            <div className="dash-card-title">
              <span className="dash-card-title-icon dash-tone-emerald">
                <CollectedIcon size={16} />
              </span>
              <h3>শ্রেণি অনুযায়ী আদায়</h3>
            </div>
            <Link href="/dashboard/reports" className="dash-card-link">
              রিপোর্ট <ArrowRightIcon size={12} />
            </Link>
          </header>

          {classStats.length === 0 ? (
            <p className="dash-empty">কোনো তথ্য নেই।</p>
          ) : (
            <ul className="collection-list">
              {classStats.map((c) => {
                const rate =
                  c.payable > 0
                    ? Math.round((c.collected / c.payable) * 100)
                    : 0;
                const rateColor =
                  rate >= 80
                    ? "emerald"
                    : rate >= 50
                    ? "amber"
                    : "rose";
                return (
                  <li key={c.class_name} className="coll-row">
                    <div className="coll-row-head">
                      <span className="coll-row-name">{c.class_name}</span>
                      <span className={`coll-rate coll-rate-${rateColor}`}>
                        {rate}%
                      </span>
                    </div>
                    <div className="coll-bar">
                      <div
                        className={`coll-bar-fill coll-bar-fill-${rateColor}`}
                        style={{ width: `${Math.min(rate, 100)}%` }}
                      />
                    </div>
                    <div className="coll-row-meta">
                      <span>আদায়: {formatTaka(c.collected)}</span>
                      <span>প্রাপ্য: {formatTaka(c.payable)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ==================== Two-Column Section 2 ==================== */}
      <section className="dash-two-col">
        {/* ---------- Left: Recent payments ---------- */}
        <div className="dash-card">
          <header className="dash-card-head">
            <div className="dash-card-title">
              <span className="dash-card-title-icon dash-tone-blue">
                <ReceiptIcon size={16} />
              </span>
              <h3>সাম্প্রতিক বেতন আদায়</h3>
            </div>
            <Link href="/dashboard/fees" className="dash-card-link">
              সব দেখুন <ArrowRightIcon size={12} />
            </Link>
          </header>

          {recentPayments.length === 0 ? (
            <p className="dash-empty">এই মাসে এখনো কোনো আদায় হয়নি।</p>
          ) : (
            <ul className="recent-list">
              {recentPayments.map((p) => (
                <li key={p.id} className="recent-row">
                  <div className="recent-avatar">
                    {p.studentName.charAt(0)}
                  </div>
                  <div className="recent-info">
                    <div className="recent-name">{p.studentName}</div>
                    <div className="recent-meta">
                      {p.receipt ? `রসিদ: ${p.receipt}` : "রসিদ নেই"}
                      {p.date && ` • ${formatShortDateBn(p.date)}`}
                    </div>
                  </div>
                  <div className="recent-amount">
                    {formatTaka(p.amount)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---------- Right: Top due students ---------- */}
        <div className="dash-card">
          <header className="dash-card-head">
            <div className="dash-card-title">
              <span className="dash-card-title-icon dash-tone-rose">
                <AlertIcon size={16} />
              </span>
              <h3>বকেয়া শিক্ষার্থী</h3>
            </div>
            <Link href="/dashboard/fees-status" className="dash-card-link">
              সব দেখুন <ArrowRightIcon size={12} />
            </Link>
          </header>

          {dueStudents.length === 0 ? (
            <p className="dash-empty">
              🎉 এই মাসে কারো বকেয়া নেই!
            </p>
          ) : (
            <ul className="recent-list">
              {dueStudents.map((s) => (
                <li key={s.id} className="recent-row">
                  <div className="recent-avatar recent-avatar-rose">
                    {s.name.charAt(0)}
                  </div>
                  <div className="recent-info">
                    <div className="recent-name">{s.name}</div>
                    <div className="recent-meta">{s.className}</div>
                  </div>
                  <div className="recent-amount recent-amount-rose">
                    {formatTaka(s.due)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ==================== Quick Actions ==================== */}
      <section className="dash-section">
        <header className="dash-section-head">
          <h2 className="dash-section-title">দ্রুত কাজ</h2>
          <p className="dash-section-sub">এক ক্লিকে সবচেয়ে বেশি ব্যবহৃত কাজ</p>
        </header>

        <div className="quick-actions">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`quick-action quick-action-${action.tone}`}
            >
              <span className="quick-action-dot" />
              <span className="quick-action-label">{action.label}</span>
              <ArrowRightIcon size={14} className="quick-action-arrow" />
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== Info Footer ==================== */}
      <section className="dash-info">
        <div className="dash-info-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
        <p className="dash-info-text">
          এই মাসে <strong>{newThisMonth} জন</strong> নতুন শিক্ষার্থী ভর্তি হয়েছে।
          উপরের যেকোনো কার্ডে ক্লিক করে বিস্তারিত দেখতে পারবেন।
        </p>
      </section>

      {/* ==================== Styles ==================== */}
      <style>{`
        /* ---------- Root ---------- */
        .dash-root {
          padding: 1.25rem 0.9rem 3rem;
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* ---------- Hero ---------- */
        .dash-hero {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          background: linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #115e59 100%);
          color: #ffffff;
          padding: 1.5rem 1.25rem 1.75rem;
          box-shadow: 0 18px 40px -22px rgba(15, 118, 110, 0.65);
        }
        .dash-hero-bg {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.10), transparent 45%),
            radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.08), transparent 55%);
          pointer-events: none;
        }
        .dash-hero-content {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .dash-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.3rem 0.7rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(4px);
          width: fit-content;
          color: #ecfdf5;
        }
        .dash-hero-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.25rem 0 0.15rem;
          line-height: 1.25;
          letter-spacing: -0.01em;
        }
        .dash-hero-sub {
          margin: 0;
          font-size: 0.9rem;
          color: #ccfbf1;
          opacity: 0.92;
        }
        .dash-hero-right {
          display: flex;
          gap: 0.65rem;
        }
        .dash-hero-metric {
          flex: 1;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 12px;
          padding: 0.6rem 0.75rem;
        }
        .dash-hero-metric-label {
          font-size: 0.7rem;
          color: #ccfbf1;
          opacity: 0.85;
          margin-bottom: 0.15rem;
        }
        .dash-hero-metric-value {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }
        .dash-hero-progress {
          position: relative;
          height: 6px;
          margin-top: 1.25rem;
          background: rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          overflow: hidden;
        }
        .dash-hero-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #facc15 0%, #fbbf24 100%);
          border-radius: 999px;
        }

        /* ---------- Section ---------- */
        .dash-section {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .dash-section-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0 0.15rem;
        }
        .dash-section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .dash-section-sub {
          font-size: 0.78rem;
          color: #64748b;
          margin: 0;
        }

        /* ---------- Stats Grid ---------- */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.7rem;
        }
        .stat-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding: 0.85rem 0.9rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px -14px rgba(15, 23, 42, 0.25);
          border-color: #cbd5e1;
        }
        .stat-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-body {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
        }
        .stat-label {
          font-size: 0.72rem;
          font-weight: 500;
          color: #64748b;
          line-height: 1.3;
        }
        .stat-value {
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1.2;
          color: #0f172a;
          word-break: break-word;
        }
        .stat-suffix {
          font-size: 0.72rem;
          font-weight: 500;
          margin-left: 0.2rem;
          color: #64748b;
        }
        .stat-arrow {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          color: #cbd5e1;
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .stat-card:hover .stat-arrow {
          color: #0f766e;
          transform: translateX(2px);
        }
        .stat-card-teal .stat-icon-wrap { background: #ccfbf1; color: #0f766e; }
        .stat-card-blue .stat-icon-wrap { background: #dbeafe; color: #1e40af; }
        .stat-card-emerald .stat-icon-wrap { background: #d1fae5; color: #15803d; }
        .stat-card-rose .stat-icon-wrap { background: #ffe4e6; color: #b91c1c; }
        .stat-card-violet .stat-icon-wrap { background: #ede9fe; color: #6d28d9; }

        /* ---------- Two Column Layout ---------- */
        .dash-two-col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .dash-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1rem 1.1rem 1.15rem;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .dash-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.9rem;
        }

        .dash-card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dash-card-title h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .dash-card-title-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dash-tone-teal { background: #ccfbf1; color: #0f766e; }
        .dash-tone-emerald { background: #d1fae5; color: #15803d; }
        .dash-tone-blue { background: #dbeafe; color: #1e40af; }
        .dash-tone-rose { background: #ffe4e6; color: #b91c1c; }

        .dash-card-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #0f766e;
          text-decoration: none;
          transition: color 0.15s ease;
          flex-shrink: 0;
        }
        .dash-card-link:hover {
          color: #0d6b63;
          text-decoration: underline;
        }

        .dash-empty {
          font-size: 0.82rem;
          color: #94a3b8;
          text-align: center;
          padding: 1rem 0;
          margin: 0;
        }

        /* ---------- Class List ---------- */
        .class-list,
        .collection-list,
        .recent-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .class-row,
        .coll-row {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .class-row-head,
        .coll-row-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .class-row-name,
        .coll-row-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .class-row-count {
          font-size: 0.78rem;
          font-weight: 700;
          color: #0f766e;
          flex-shrink: 0;
        }

        .class-bar,
        .coll-bar {
          position: relative;
          height: 6px;
          background: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
        }

        .class-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #0f766e, #14b8a6);
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        .class-row-meta,
        .coll-row-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          font-size: 0.72rem;
          color: #94a3b8;
        }

        .class-meta-paid { color: #15803d; font-weight: 500; }
        .class-meta-due { color: #b91c1c; font-weight: 500; }

        .coll-rate {
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 999px;
          flex-shrink: 0;
        }
        .coll-rate-emerald { background: #d1fae5; color: #15803d; }
        .coll-rate-amber { background: #fef3c7; color: #b45309; }
        .coll-rate-rose { background: #ffe4e6; color: #b91c1c; }

        .coll-bar-fill-emerald { background: linear-gradient(90deg, #16a34a, #22c55e); }
        .coll-bar-fill-amber { background: linear-gradient(90deg, #d97706, #f59e0b); }
        .coll-bar-fill-rose { background: linear-gradient(90deg, #dc2626, #ef4444); }

        /* ---------- Recent List ---------- */
        .recent-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .recent-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0f766e, #14b8a6);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .recent-avatar-rose {
          background: linear-gradient(135deg, #dc2626, #f87171);
        }

        .recent-info {
          min-width: 0;
          flex: 1;
        }

        .recent-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .recent-meta {
          font-size: 0.72rem;
          color: #94a3b8;
          margin-top: 0.1rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .recent-amount {
          font-size: 0.85rem;
          font-weight: 700;
          color: #15803d;
          flex-shrink: 0;
        }

        .recent-amount-rose {
          color: #b91c1c;
        }

        /* ---------- Quick Actions ---------- */
        .quick-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
        }
        .quick-action {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.6rem 0.9rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          text-decoration: none;
          color: #0f172a;
          font-size: 0.82rem;
          font-weight: 500;
          transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }
        .quick-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px -10px rgba(15, 23, 42, 0.25);
          border-color: #cbd5e1;
        }
        .quick-action-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .quick-action-arrow {
          color: #94a3b8;
          transition: transform 0.15s ease, color 0.15s ease;
        }
        .quick-action:hover .quick-action-arrow {
          color: #0f766e;
          transform: translateX(2px);
        }
        .quick-action-teal .quick-action-dot { background: #0f766e; }
        .quick-action-emerald .quick-action-dot { background: #15803d; }
        .quick-action-blue .quick-action-dot { background: #1e40af; }
        .quick-action-rose .quick-action-dot { background: #b91c1c; }
        .quick-action-violet .quick-action-dot { background: #6d28d9; }

        /* ---------- Info Footer ---------- */
        .dash-info {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.9rem 1rem;
          background: #f0fdfa;
          border: 1px solid #99f6e4;
          border-radius: 12px;
        }
        .dash-info-icon {
          width: 24px;
          height: 24px;
          color: #0f766e;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .dash-info-icon svg {
          width: 100%;
          height: 100%;
        }
        .dash-info-text {
          margin: 0;
          font-size: 0.8rem;
          line-height: 1.55;
          color: #0f766e;
        }
        .dash-info-text strong {
          font-weight: 700;
          color: #0d6b63;
        }

        /* =========================================
           Tablet
           ========================================= */
        @media (min-width: 640px) {
          .dash-root {
            padding: 1.75rem 1.25rem 3.5rem;
            gap: 1.75rem;
          }
          .dash-hero {
            padding: 1.85rem 1.75rem 2rem;
            border-radius: 20px;
          }
          .dash-hero-title { font-size: 1.75rem; }
          .dash-hero-sub { font-size: 0.95rem; }
          .dash-hero-content {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .dash-hero-right {
            min-width: 260px;
            max-width: 320px;
          }
          .dash-hero-metric-value { font-size: 1.3rem; }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.9rem;
          }
          .stat-card {
            padding: 1.05rem 1.1rem;
            border-radius: 16px;
          }
          .stat-icon-wrap {
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }
          .stat-label { font-size: 0.78rem; }
          .stat-value { font-size: 1.25rem; }
          .dash-section-title { font-size: 1.15rem; }
          .quick-action {
            font-size: 0.86rem;
            padding: 0.65rem 1.05rem;
          }
          .dash-card { padding: 1.1rem 1.25rem 1.25rem; }
        }

        /* =========================================
           Desktop
           ========================================= */
        @media (min-width: 1024px) {
          .dash-root {
            padding: 2rem 2rem 4rem;
            gap: 2rem;
          }
          .dash-hero {
            padding: 2.25rem 2.25rem 2.4rem;
            border-radius: 22px;
          }
          .dash-hero-title { font-size: 1.9rem; }
          .dash-hero-metric-value { font-size: 1.45rem; }

          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
          }
          .stat-value { font-size: 1.35rem; }

          .dash-two-col {
            grid-template-columns: 1fr 1fr;
            gap: 1.25rem;
          }

          .dash-card-title h3 { font-size: 1rem; }
        }

        /* =========================================
           Dark Mode
           ========================================= */
        .dark .dash-root { color: #e2e8f0; }
        .dark .dash-section-title { color: #f1f5f9; }
        .dark .dash-section-sub { color: #94a3b8; }

        .dark .stat-card {
          background: #0f172a;
          border-color: #1e293b;
        }
        .dark .stat-card:hover {
          border-color: #334155;
          box-shadow: 0 12px 26px -14px rgba(0, 0, 0, 0.7);
        }
        .dark .stat-label { color: #94a3b8; }
        .dark .stat-value { color: #f1f5f9; }
        .dark .stat-suffix { color: #94a3b8; }
        .dark .stat-arrow { color: #475569; }
        .dark .stat-card:hover .stat-arrow { color: #5eead4; }

        .dark .stat-card-teal .stat-icon-wrap { background: rgba(15, 118, 110, 0.2); color: #5eead4; }
        .dark .stat-card-blue .stat-icon-wrap { background: rgba(30, 64, 175, 0.25); color: #93c5fd; }
        .dark .stat-card-emerald .stat-icon-wrap { background: rgba(21, 128, 61, 0.22); color: #86efac; }
        .dark .stat-card-rose .stat-icon-wrap { background: rgba(185, 28, 28, 0.22); color: #fca5a5; }
        .dark .stat-card-violet .stat-icon-wrap { background: rgba(109, 40, 217, 0.25); color: #c4b5fd; }

        .dark .dash-card {
          background: #0f172a;
          border-color: #1e293b;
        }
        .dark .dash-card-title h3 { color: #f1f5f9; }
        .dark .dash-card-link { color: #5eead4; }
        .dark .dash-card-link:hover { color: #99f6e4; }

        .dark .dash-tone-teal { background: rgba(15, 118, 110, 0.22); color: #5eead4; }
        .dark .dash-tone-emerald { background: rgba(21, 128, 61, 0.22); color: #86efac; }
        .dark .dash-tone-blue { background: rgba(30, 64, 175, 0.25); color: #93c5fd; }
        .dark .dash-tone-rose { background: rgba(185, 28, 28, 0.22); color: #fca5a5; }

        .dark .dash-empty { color: #64748b; }

        .dark .class-row-name,
        .dark .coll-row-name { color: #cbd5e1; }

        .dark .class-bar,
        .dark .coll-bar { background: #1e293b; }

        .dark .class-row-meta,
        .dark .coll-row-meta { color: #64748b; }

        .dark .recent-name { color: #f1f5f9; }
        .dark .recent-meta { color: #64748b; }

        .dark .quick-action {
          background: #0f172a;
          border-color: #1e293b;
          color: #e2e8f0;
        }
        .dark .quick-action:hover {
          border-color: #334155;
          background: #111f36;
        }
        .dark .quick-action-arrow { color: #475569; }
        .dark .quick-action:hover .quick-action-arrow { color: #5eead4; }

        .dark .dash-info {
          background: rgba(15, 118, 110, 0.12);
          border-color: rgba(94, 234, 212, 0.25);
        }
        .dark .dash-info-icon,
        .dark .dash-info-text { color: #5eead4; }
        .dark .dash-info-text strong { color: #99f6e4; }
      `}</style>
    </main>
  );
}
