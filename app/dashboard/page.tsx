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
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
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
const ClassIcon = ({ size = 16, className }: IconProps) => (
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
const TrendingUpIcon = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
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

  /* ---------- Students details ---------- */
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

  /* ---------- Payments ---------- */
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

  /* ---------- Income / Expense ---------- */
  const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const monthEnd = new Date(currentYear, currentMonth, 0).toISOString().split("T")[0];

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
  const balance = totalIncome + totalCollected - totalExpense;

  /* ---------- Paid / Unpaid ---------- */
  const paidStudentIds = new Set<number>();
  payments?.forEach((p) => p.student_id && paidStudentIds.add(p.student_id));
  const paidCount = paidStudentIds.size;
  const unpaidCount = (studentCount || 0) - paidCount;

  /* ---------- Class aggregation ---------- */
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
      classMap.set(cn, { class_name: cn, total: 0, paid: 0, payable: 0, collected: 0 });
    }
    const entry = classMap.get(cn)!;
    entry.total += 1;
    entry.payable += Number(s.monthly_fee || 0) - Number(s.discount || 0);
    if (paidStudentIds.has(s.id)) entry.paid += 1;
  });

  const studentClassMap = new Map<number, string>();
  students?.forEach((s) => studentClassMap.set(s.id, s.class_name || "অজানা"));
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

  /* ---------- Recent payments ---------- */
  const studentNameMap = new Map<number, string>();
  students?.forEach((s) => studentNameMap.set(s.id, s.name));

  const recentPayments = (payments || []).slice(0, 5).map((p) => ({
    id: p.id,
    studentName: p.student_id ? studentNameMap.get(p.student_id) || "—" : "—",
    amount: Number(p.amount || 0),
    date: p.payment_date,
    receipt: p.receipt_no,
  }));

  /* ---------- Top due ---------- */
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

  /* ---------- New admissions ---------- */
  const monthStartDate = new Date(currentYear, currentMonth - 1, 1);
  const newThisMonth =
    students?.filter((s) => {
      const d = s.admission_date ? new Date(s.admission_date) : null;
      return d && d >= monthStartDate;
    }).length || 0;

  /* ---------- Rates ---------- */
  const collectionRate =
    totalPayable > 0 ? Math.round((totalCollected / totalPayable) * 100) : 0;
  const paidRate =
    studentCount && studentCount > 0 ? Math.round((paidCount / studentCount) * 100) : 0;

  const monthName = now.toLocaleString("bn-BD", { month: "long" });
  const formattedDate = formatDateBn(now);

  /* ---------- Stats ---------- */
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

  const quickActions = [
    { href: "/dashboard/students", label: "শিক্ষার্থী যোগ", tone: "teal" },
    { href: "/dashboard/fees", label: "বেতন গ্রহণ", tone: "emerald" },
    { href: "/dashboard/income", label: "আয় যোগ", tone: "blue" },
    { href: "/dashboard/expenses", label: "ব্যয় যোগ", tone: "rose" },
    { href: "/dashboard/reports", label: "রিপোর্ট দেখুন", tone: "violet" },
  ];

  const maxClassTotal = Math.max(1, ...classStats.map((c) => c.total));

  return (
    <main className="dash-root">
      {/* ==================== HERO ==================== */}
      <section className="hero">
        <div className="hero-mesh" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 L12 4" />
                <path d="M12 4 C 8 6, 6 9, 6 13 L 6 21 L 18 21 L 18 13 C 18 9, 16 6, 12 4 Z" />
                <path d="M10 21 L 10 17 C 10 15.5, 14 15.5, 14 17 L 14 21" />
                <path d="M3 21 L 21 21" />
              </svg>
            </div>

            <span className="hero-date">
              <CalendarIcon size={13} />
              {formattedDate}
            </span>

            <h1 className="hero-title">আসসালামু আলাইকুম 👋</h1>

            <p className="hero-sub">
              {monthName} {currentYear} — আজকের সারসংক্ষেপ
            </p>
          </div>

          <div className="hero-metrics">
            <div className="hero-metric">
              <div className="hero-metric-glow hero-metric-glow-amber" />
              <div className="hero-metric-label">
                <TrendingUpIcon size={12} />
                আদায়ের হার
              </div>
              <div className="hero-metric-value">{collectionRate}%</div>
              <div className="hero-metric-sub">
                {formatTaka(totalCollected)} / {formatTaka(totalPayable)}
              </div>
            </div>
            <div className="hero-metric">
              <div className="hero-metric-glow hero-metric-glow-emerald" />
              <div className="hero-metric-label">
                <PaidIcon size={12} />
                Paid শিক্ষার্থী
              </div>
              <div className="hero-metric-value">{paidRate}%</div>
              <div className="hero-metric-sub">
                {paidCount} / {studentCount || 0} জন
              </div>
            </div>
          </div>
        </div>

        <div className="hero-progress">
          <div className="hero-progress-track">
            <div
              className="hero-progress-fill"
              style={{ width: `${Math.min(collectionRate, 100)}%` }}
            />
            <div className="hero-progress-shimmer" aria-hidden="true" />
          </div>
          <div className="hero-progress-label">
            <span>মাসিক আদায়ের অগ্রগতি</span>
            <span className="hero-progress-percent">{collectionRate}%</span>
          </div>
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section className="dash-section">
        <header className="section-head">
          <div>
            <h2 className="section-title">আর্থিক সারসংক্ষেপ</h2>
            <p className="section-sub">{monthName} {currentYear}</p>
          </div>
        </header>

        <div className="stats-grid">
          {stats.map((stat) => {
            const { Icon } = stat;
            return (
              <Link key={stat.label} href={stat.href} className={`stat stat-${stat.tone}`}>
                <div className={`stat-accent stat-accent-${stat.tone}`} />
                <div className="stat-head">
                  <span className={`stat-icon stat-icon-${stat.tone}`}>
                    <Icon size={18} />
                  </span>
                  <span className="stat-arrow">
                    <ArrowRightIcon size={13} />
                  </span>
                </div>
                <div className="stat-value">
                  {stat.value}
                  {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
                </div>
                <div className="stat-label">{stat.label}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ==================== CLASS + COLLECTION ==================== */}
      <section className="two-col">
        {/* Class-wise students */}
        <div className="card">
          <header className="card-head">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-teal">
                <ClassIcon size={15} />
              </span>
              <div>
                <h3 className="card-title">শ্রেণিভিত্তিক শিক্ষার্থী</h3>
                <p className="card-sub">{classStats.length} টি শ্রেণি</p>
              </div>
            </div>
            <Link href="/dashboard/students" className="card-link">
              সব দেখুন <ArrowRightIcon size={11} />
            </Link>
          </header>

          {classStats.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📚</div>
              <p className="empty-text">কোনো শিক্ষার্থী নেই</p>
            </div>
          ) : (
            <ul className="class-list">
              {classStats.map((c, i) => {
                const width = Math.round((c.total / maxClassTotal) * 100);
                const hue = (i * 47) % 360;
                return (
                  <li key={c.class_name} className="class-item">
                    <div className="class-top">
                      <div
                        className="class-avatar"
                        style={{
                          background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${hue} 70% 60%))`,
                        }}
                      >
                        {c.class_name.charAt(0)}
                      </div>
                      <span className="class-name">{c.class_name}</span>
                      <span className="class-count">{c.total}</span>
                    </div>
                    <div className="class-bar">
                      <div className="class-bar-fill" style={{ width: `${width}%` }} />
                    </div>
                    <div className="class-meta">
                      <span className="pill pill-emerald">Paid {c.paid}</span>
                      <span className="pill pill-rose">Unpaid {c.total - c.paid}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Class-wise collection */}
        <div className="card">
          <header className="card-head">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-emerald">
                <CollectedIcon size={15} />
              </span>
              <div>
                <h3 className="card-title">শ্রেণি অনুযায়ী আদায়</h3>
                <p className="card-sub">চলতি মাস</p>
              </div>
            </div>
            <Link href="/dashboard/reports" className="card-link">
              রিপোর্ট <ArrowRightIcon size={11} />
            </Link>
          </header>

          {classStats.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📊</div>
              <p className="empty-text">কোনো তথ্য নেই</p>
            </div>
          ) : (
            <ul className="coll-list">
              {classStats.map((c) => {
                const rate = c.payable > 0 ? Math.round((c.collected / c.payable) * 100) : 0;
                const tone = rate >= 80 ? "emerald" : rate >= 50 ? "amber" : "rose";
                return (
                  <li key={c.class_name} className="coll-item">
                    <div className="coll-top">
                      <span className="coll-name">{c.class_name}</span>
                      <span className={`coll-rate coll-rate-${tone}`}>{rate}%</span>
                    </div>
                    <div className="coll-bar">
                      <div
                        className={`coll-bar-fill coll-bar-fill-${tone}`}
                        style={{ width: `${Math.min(rate, 100)}%` }}
                      />
                    </div>
                    <div className="coll-meta">
                      <span className="coll-meta-paid">{formatTaka(c.collected)}</span>
                      <span className="coll-meta-total">/ {formatTaka(c.payable)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ==================== RECENT + DUE ==================== */}
      <section className="two-col">
        <div className="card">
          <header className="card-head">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-blue">
                <ReceiptIcon size={15} />
              </span>
              <div>
                <h3 className="card-title">সাম্প্রতিক বেতন আদায়</h3>
                <p className="card-sub">সর্বশেষ ৫টি</p>
              </div>
            </div>
            <Link href="/dashboard/fees" className="card-link">
              সব দেখুন <ArrowRightIcon size={11} />
            </Link>
          </header>

          {recentPayments.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">💰</div>
              <p className="empty-text">এই মাসে এখনো কোনো আদায় হয়নি</p>
            </div>
          ) : (
            <ul className="list">
              {recentPayments.map((p, i) => (
                <li key={p.id} className="list-item" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="list-avatar">{p.studentName.charAt(0)}</div>
                  <div className="list-info">
                    <div className="list-name">{p.studentName}</div>
                    <div className="list-meta">
                      {p.receipt ? `#${p.receipt}` : "রসিদ নেই"}
                      {p.date && ` · ${formatShortDateBn(p.date)}`}
                    </div>
                  </div>
                  <div className="list-amount list-amount-green">{formatTaka(p.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <header className="card-head">
            <div className="card-title-wrap">
              <span className="card-icon card-icon-rose">
                <AlertIcon size={15} />
              </span>
              <div>
                <h3 className="card-title">বকেয়া শিক্ষার্থী</h3>
                <p className="card-sub">সর্বোচ্চ {dueStudents.length} জন</p>
              </div>
            </div>
            <Link href="/dashboard/fees-status" className="card-link">
              সব দেখুন <ArrowRightIcon size={11} />
            </Link>
          </header>

          {dueStudents.length === 0 ? (
            <div className="empty empty-success">
              <div className="empty-icon">🎉</div>
              <p className="empty-text">এই মাসে কারো বকেয়া নেই!</p>
            </div>
          ) : (
            <ul className="list">
              {dueStudents.map((s, i) => (
                <li key={s.id} className="list-item" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="list-avatar list-avatar-rose">{s.name.charAt(0)}</div>
                  <div className="list-info">
                    <div className="list-name">{s.name}</div>
                    <div className="list-meta">{s.className}</div>
                  </div>
                  <div className="list-amount list-amount-rose">{formatTaka(s.due)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ==================== QUICK ACTIONS ==================== */}
      <section className="dash-section">
        <header className="section-head">
          <div>
            <h2 className="section-title">দ্রুত কাজ</h2>
            <p className="section-sub">এক ক্লিকে সবচেয়ে বেশি ব্যবহৃত</p>
          </div>
        </header>

        <div className="quick">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} className={`quick-item quick-item-${a.tone}`}>
              <span className="quick-dot" />
              <span className="quick-label">{a.label}</span>
              <ArrowRightIcon size={13} className="quick-arrow" />
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== INFO ==================== */}
      <section className="info">
        <div className="info-icon">💡</div>
        <p className="info-text">
          এই মাসে <strong>{newThisMonth} জন</strong> নতুন শিক্ষার্থী ভর্তি হয়েছে।
          উপরের যেকোনো কার্ডে ক্লিক করে বিস্তারিত দেখতে পারবেন।
        </p>
      </section>

      {/* ==================== STYLES ==================== */}
      <style>{`
        .dash-root {
          padding: 1.25rem 0.9rem 3rem;
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: fadeIn 0.4s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============ HERO ============ */
        .hero {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          background: linear-gradient(135deg, #0f766e 0%, #0d9488 45%, #115e59 100%);
          color: #ffffff;
          padding: 1.75rem 1.5rem 1.9rem;
          box-shadow:
            0 2px 4px rgba(15, 23, 42, 0.06),
            0 20px 45px -25px rgba(15, 118, 110, 0.7);
        }
        .hero-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 15% 20%, rgba(255,255,255,0.16), transparent 40%),
            radial-gradient(circle at 85% 10%, rgba(255,255,255,0.10), transparent 45%),
            radial-gradient(circle at 60% 90%, rgba(250,204,21,0.10), transparent 40%);
          pointer-events: none;
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse at center, #000 40%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at center, #000 40%, transparent 75%);
          pointer-events: none;
          opacity: 0.5;
        }
        .hero-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }
        .hero-logo {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          margin-bottom: 0.4rem;
          box-shadow: 0 8px 20px -10px rgba(0,0,0,0.4);
        }
        .hero-logo svg {
          width: 26px;
          height: 26px;
        }
        .hero-date {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 500;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.18);
          width: fit-content;
          color: #ecfdf5;
          letter-spacing: 0.01em;
        }
        .hero-title {
          font-size: 1.65rem;
          font-weight: 700;
          margin: 0.75rem 0 0.25rem;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #ffffff;
        }
        .hero-sub {
          margin: 0;
          font-size: 0.92rem;
          color: #ccfbf1;
          opacity: 0.9;
        }
        .hero-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.7rem;
        }
        .hero-metric {
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 14px;
          padding: 0.85rem 0.9rem;
        }
        .hero-metric-glow {
          position: absolute;
          top: -30%;
          right: -20%;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          filter: blur(30px);
          opacity: 0.5;
          pointer-events: none;
        }
        .hero-metric-glow-amber { background: #fbbf24; }
        .hero-metric-glow-emerald { background: #34d399; }
        .hero-metric-label {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          color: #ccfbf1;
          opacity: 0.9;
          margin-bottom: 0.35rem;
          font-weight: 500;
        }
        .hero-metric-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .hero-metric-sub {
          font-size: 0.68rem;
          color: #a7f3d0;
          margin-top: 0.3rem;
          opacity: 0.85;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hero-progress {
          position: relative;
          margin-top: 1.5rem;
        }
        .hero-progress-track {
          position: relative;
          height: 8px;
          background: rgba(255,255,255,0.15);
          border-radius: 999px;
          overflow: hidden;
        }
        .hero-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24 0%, #facc15 100%);
          border-radius: 999px;
          box-shadow: 0 0 12px rgba(250, 204, 21, 0.5);
          position: relative;
          z-index: 2;
        }
        .hero-progress-shimmer {
          position: absolute;
          top: 0;
          left: -50%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: shimmer 2.5s infinite;
          z-index: 3;
        }
        @keyframes shimmer {
          0% { left: -50%; }
          100% { left: 100%; }
        }
        .hero-progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.72rem;
          color: #ccfbf1;
          margin-top: 0.5rem;
          opacity: 0.9;
        }
        .hero-progress-percent {
          font-weight: 700;
          color: #fde68a;
        }

        /* ============ SECTION ============ */
        .dash-section { display: flex; flex-direction: column; gap: 1rem; }
        .section-head { padding: 0 0.25rem; }
        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem;
          letter-spacing: -0.01em;
        }
        .section-sub {
          font-size: 0.78rem;
          color: #64748b;
          margin: 0;
        }

        /* ============ STATS ============ */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.7rem;
        }
        .stat {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem 0.9rem 0.9rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
                      box-shadow 0.25s ease,
                      border-color 0.2s ease;
          box-shadow:
            0 1px 2px rgba(15, 23, 42, 0.04),
            0 4px 12px -8px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }
        .stat::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: linear-gradient(135deg, transparent 60%, rgba(15,118,110,0.1) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .stat:hover {
          transform: translateY(-3px);
          box-shadow:
            0 2px 4px rgba(15, 23, 42, 0.06),
            0 16px 30px -16px rgba(15, 23, 42, 0.25);
          border-color: #cbd5e1;
        }
        .stat:hover::before { opacity: 1; }

        .stat-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          border-radius: 16px 16px 0 0;
        }
        .stat-accent-teal { background: linear-gradient(90deg, #0f766e, #14b8a6); }
        .stat-accent-blue { background: linear-gradient(90deg, #1e40af, #3b82f6); }
        .stat-accent-emerald { background: linear-gradient(90deg, #15803d, #22c55e); }
        .stat-accent-rose { background: linear-gradient(90deg, #b91c1c, #ef4444); }
        .stat-accent-violet { background: linear-gradient(90deg, #6d28d9, #a855f7); }

        .stat-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .stat:hover .stat-icon { transform: scale(1.06); }

        .stat-icon-teal { background: linear-gradient(135deg, #ccfbf1, #99f6e4); color: #0f766e; }
        .stat-icon-blue { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1e40af; }
        .stat-icon-emerald { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #15803d; }
        .stat-icon-rose { background: linear-gradient(135deg, #ffe4e6, #fecdd3); color: #b91c1c; }
        .stat-icon-violet { background: linear-gradient(135deg, #ede9fe, #ddd6fe); color: #6d28d9; }

        .stat-arrow {
          color: #cbd5e1;
          transition: transform 0.25s ease, color 0.25s ease;
        }
        .stat:hover .stat-arrow {
          color: #0f766e;
          transform: translateX(3px);
        }
        .stat-value {
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.1;
          color: #0f172a;
          letter-spacing: -0.02em;
          word-break: break-word;
        }
        .stat-suffix {
          font-size: 0.7rem;
          font-weight: 500;
          margin-left: 0.2rem;
          color: #94a3b8;
        }
        .stat-label {
          font-size: 0.72rem;
          font-weight: 500;
          color: #64748b;
          line-height: 1.35;
          margin-top: -0.2rem;
        }

        /* ============ TWO COL ============ */
        .two-col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 1.15rem 1.2rem 1.25rem;
          box-shadow:
            0 1px 2px rgba(15, 23, 42, 0.04),
            0 6px 16px -10px rgba(15, 23, 42, 0.08);
        }

        .card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 1.1rem;
        }
        .card-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .card-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .card-icon-teal { background: linear-gradient(135deg, #ccfbf1, #99f6e4); color: #0f766e; }
        .card-icon-emerald { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #15803d; }
        .card-icon-blue { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1e40af; }
        .card-icon-rose { background: linear-gradient(135deg, #ffe4e6, #fecdd3); color: #b91c1c; }

        .card-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .card-sub {
          font-size: 0.7rem;
          color: #94a3b8;
          margin: 0.1rem 0 0;
        }
        .card-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: #0f766e;
          text-decoration: none;
          padding: 0.35rem 0.6rem;
          border-radius: 8px;
          transition: background 0.15s ease, color 0.15s ease;
          flex-shrink: 0;
        }
        .card-link:hover {
          background: #f0fdfa;
          color: #0d6b63;
        }

        /* ============ EMPTY ============ */
        .empty {
          text-align: center;
          padding: 1.75rem 0;
        }
        .empty-icon { font-size: 1.5rem; margin-bottom: 0.35rem; }
        .empty-text {
          font-size: 0.82rem;
          color: #94a3b8;
          margin: 0;
        }
        .empty-success .empty-text { color: #15803d; font-weight: 500; }

        /* ============ CLASS LIST ============ */
        .class-list, .coll-list, .list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
        }
        .class-item {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .class-item:last-child { border-bottom: none; padding-bottom: 0; }
        .class-item:first-child { padding-top: 0; }

        .class-top {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .class-avatar {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.78rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 3px 8px -3px rgba(0,0,0,0.25);
        }
        .class-name {
          flex: 1;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .class-count {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f766e;
          background: #f0fdfa;
          padding: 0.15rem 0.55rem;
          border-radius: 6px;
          border: 1px solid #99f6e4;
        }
        .class-bar {
          height: 6px;
          background: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
        }
        .class-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #0f766e, #14b8a6);
          border-radius: 999px;
          transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .class-meta {
          display: flex;
          gap: 0.4rem;
          align-items: center;
        }
        .pill {
          font-size: 0.68rem;
          font-weight: 600;
          padding: 0.15rem 0.55rem;
          border-radius: 6px;
          letter-spacing: 0.01em;
        }
        .pill-emerald { background: #ecfdf5; color: #15803d; }
        .pill-rose { background: #fef2f2; color: #b91c1c; }

        /* ============ COLLECTION LIST ============ */
        .coll-item {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .coll-item:last-child { border-bottom: none; padding-bottom: 0; }
        .coll-item:first-child { padding-top: 0; }

        .coll-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .coll-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .coll-rate {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.18rem 0.55rem;
          border-radius: 999px;
          flex-shrink: 0;
          letter-spacing: 0.01em;
        }
        .coll-rate-emerald { background: #ecfdf5; color: #15803d; border: 1px solid #a7f3d0; }
        .coll-rate-amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
        .coll-rate-rose { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

        .coll-bar {
          height: 6px;
          background: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
        }
        .coll-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .coll-bar-fill-emerald { background: linear-gradient(90deg, #16a34a, #22c55e); }
        .coll-bar-fill-amber { background: linear-gradient(90deg, #d97706, #f59e0b); }
        .coll-bar-fill-rose { background: linear-gradient(90deg, #dc2626, #ef4444); }

        .coll-meta {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
        }
        .coll-meta-paid { color: #15803d; font-weight: 700; }
        .coll-meta-total { color: #94a3b8; }

        /* ============ RECENT / DUE LIST ============ */
        .list-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.5rem;
          margin: 0 -0.5rem;
          border-radius: 10px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s ease;
          animation: listIn 0.4s ease backwards;
        }
        @keyframes listIn {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .list-item:last-child { border-bottom: none; }
        .list-item:hover { background: #f8fafc; }
        .list-avatar {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          background: linear-gradient(135deg, #0f766e, #14b8a6);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 10px -4px rgba(15,118,110,0.5);
        }
        .list-avatar-rose {
          background: linear-gradient(135deg, #dc2626, #f87171);
          box-shadow: 0 4px 10px -4px rgba(220,38,38,0.5);
        }
        .list-info {
          min-width: 0;
          flex: 1;
        }
        .list-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .list-meta {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 0.15rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .list-amount {
          font-size: 0.85rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .list-amount-green { color: #15803d; }
        .list-amount-rose { color: #b91c1c; }

        /* ============ QUICK ACTIONS ============ */
        .quick {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
        }
        .quick-item {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          text-decoration: none;
          color: #0f172a;
          font-size: 0.82rem;
          font-weight: 600;
          transition: transform 0.15s ease,
                      box-shadow 0.2s ease,
                      border-color 0.2s ease,
                      background 0.2s ease;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }
        .quick-item:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
          box-shadow: 0 8px 20px -12px rgba(15, 23, 42, 0.3);
        }
        .quick-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .quick-arrow {
          color: #94a3b8;
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .quick-item:hover .quick-arrow {
          color: #0f766e;
          transform: translateX(3px);
        }
        .quick-item-teal .quick-dot { background: #0f766e; box-shadow: 0 0 8px rgba(15,118,110,0.5); }
        .quick-item-emerald .quick-dot { background: #15803d; box-shadow: 0 0 8px rgba(21,128,61,0.5); }
        .quick-item-blue .quick-dot { background: #1e40af; box-shadow: 0 0 8px rgba(30,64,175,0.5); }
        .quick-item-rose .quick-dot { background: #b91c1c; box-shadow: 0 0 8px rgba(185,28,28,0.5); }
        .quick-item-violet .quick-dot { background: #6d28d9; box-shadow: 0 0 8px rgba(109,40,217,0.5); }

        /* ============ INFO ============ */
        .info {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem 1.1rem;
          background: linear-gradient(135deg, #f0fdfa, #ecfdf5);
          border: 1px solid #a7f3d0;
          border-radius: 14px;
          box-shadow: 0 4px 12px -10px rgba(15,118,110,0.25);
        }
        .info-icon {
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .info-text {
          margin: 0;
          font-size: 0.82rem;
          line-height: 1.55;
          color: #0f766e;
        }
        .info-text strong { color: #0d6b63; font-weight: 700; }

        /* ============================================
           TABLET
           ============================================ */
        @media (min-width: 640px) {
          .dash-root {
            padding: 1.75rem 1.25rem 3.5rem;
            gap: 1.75rem;
          }
          .hero {
            padding: 2rem 2rem 2.25rem;
            border-radius: 26px;
          }
          .hero-inner {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
            gap: 2rem;
          }
          .hero-logo {
            width: 56px;
            height: 56px;
            border-radius: 16px;
          }
          .hero-logo svg { width: 30px; height: 30px; }
          .hero-title { font-size: 2rem; }
          .hero-sub { font-size: 0.98rem; }
          .hero-metrics {
            min-width: 300px;
            max-width: 360px;
          }
          .hero-metric { padding: 1rem; border-radius: 16px; }
          .hero-metric-value { font-size: 1.6rem; }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.9rem;
          }
          .stat {
            padding: 1.15rem 1.15rem 1.05rem;
            border-radius: 18px;
          }
          .stat-value { font-size: 1.45rem; }
          .stat-label { font-size: 0.76rem; }
          .stat-icon { width: 40px; height: 40px; border-radius: 12px; }

          .section-title { font-size: 1.2rem; }
          .card { padding: 1.25rem 1.35rem 1.4rem; border-radius: 20px; }
          .card-title { font-size: 0.98rem; }
        }

        /* ============================================
           DESKTOP
           ============================================ */
        @media (min-width: 1024px) {
          .dash-root {
            padding: 2rem 2rem 4rem;
            gap: 2rem;
          }
          .hero {
            padding: 2.4rem 2.5rem 2.6rem;
            border-radius: 28px;
          }
          .hero-title { font-size: 2.25rem; }
          .hero-metric-value { font-size: 1.75rem; }

          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
          }
          .stat-value { font-size: 1.55rem; }

          .two-col {
            grid-template-columns: 1fr 1fr;
            gap: 1.25rem;
          }
        }

        /* ============================================
           DARK MODE
           ============================================ */
        .dark .dash-root { color: #e2e8f0; }
        .dark .section-title { color: #f1f5f9; }
        .dark .section-sub { color: #94a3b8; }

        .dark .stat {
          background: #0f172a;
          border-color: #1e293b;
          box-shadow: 0 1px 2px rgba(0,0,0,0.4), 0 4px 12px -8px rgba(0,0,0,0.5);
        }
        .dark .stat:hover {
          border-color: #334155;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4), 0 16px 30px -16px rgba(0,0,0,0.7);
        }
        .dark .stat-value { color: #f1f5f9; }
        .dark .stat-suffix { color: #64748b; }
        .dark .stat-label { color: #94a3b8; }
        .dark .stat-arrow { color: #475569; }
        .dark .stat:hover .stat-arrow { color: #5eead4; }

        .dark .stat-icon-teal { background: linear-gradient(135deg, rgba(15,118,110,0.35), rgba(20,184,166,0.25)); color: #5eead4; }
        .dark .stat-icon-blue { background: linear-gradient(135deg, rgba(30,64,175,0.35), rgba(59,130,246,0.25)); color: #93c5fd; }
        .dark .stat-icon-emerald { background: linear-gradient(135deg, rgba(21,128,61,0.35), rgba(34,197,94,0.25)); color: #86efac; }
        .dark .stat-icon-rose { background: linear-gradient(135deg, rgba(185,28,28,0.35), rgba(239,68,68,0.25)); color: #fca5a5; }
        .dark .stat-icon-violet { background: linear-gradient(135deg, rgba(109,40,217,0.35), rgba(168,85,247,0.25)); color: #c4b5fd; }

        .dark .card {
          background: #0f172a;
          border-color: #1e293b;
          box-shadow: 0 1px 2px rgba(0,0,0,0.4), 0 6px 16px -10px rgba(0,0,0,0.5);
        }
        .dark .card-title { color: #f1f5f9; }
        .dark .card-sub { color: #64748b; }
        .dark .card-link { color: #5eead4; }
        .dark .card-link:hover { background: rgba(15,118,110,0.15); color: #99f6e4; }

        .dark .card-icon-teal { background: linear-gradient(135deg, rgba(15,118,110,0.35), rgba(20,184,166,0.25)); color: #5eead4; }
        .dark .card-icon-emerald { background: linear-gradient(135deg, rgba(21,128,61,0.35), rgba(34,197,94,0.25)); color: #86efac; }
        .dark .card-icon-blue { background: linear-gradient(135deg, rgba(30,64,175,0.35), rgba(59,130,246,0.25)); color: #93c5fd; }
        .dark .card-icon-rose { background: linear-gradient(135deg, rgba(185,28,28,0.35), rgba(239,68,68,0.25)); color: #fca5a5; }

        .dark .empty-text { color: #64748b; }
        .dark .empty-success .empty-text { color: #5eead4; }

        .dark .class-item, .dark .coll-item { border-bottom-color: #1e293b; }
        .dark .class-name { color: #cbd5e1; }
        .dark .class-count { background: rgba(15,118,110,0.2); color: #5eead4; border-color: rgba(94,234,212,0.3); }
        .dark .class-bar { background: #1e293b; }
        .dark .pill-emerald { background: rgba(21,128,61,0.2); color: #86efac; }
        .dark .pill-rose { background: rgba(185,28,28,0.2); color: #fca5a5; }

        .dark .coll-name { color: #cbd5e1; }
        .dark .coll-bar { background: #1e293b; }
        .dark .coll-rate-emerald { background: rgba(21,128,61,0.2); color: #86efac; border-color: rgba(134,239,172,0.3); }
        .dark .coll-rate-amber { background: rgba(180,83,9,0.2); color: #fcd34d; border-color: rgba(252,211,77,0.3); }
        .dark .coll-rate-rose { background: rgba(185,28,28,0.2); color: #fca5a5; border-color: rgba(252,165,165,0.3); }
        .dark .coll-meta-paid { color: #86efac; }
        .dark .coll-meta-total { color: #64748b; }

        .dark .list-item { border-bottom-color: #1e293b; }
        .dark .list-item:hover { background: #111f36; }
        .dark .list-name { color: #f1f5f9; }
        .dark .list-meta { color: #64748b; }
        .dark .list-amount-green { color: #86efac; }
        .dark .list-amount-rose { color: #fca5a5; }

        .dark .quick-item {
          background: #0f172a;
          border-color: #1e293b;
          color: #e2e8f0;
        }
        .dark .quick-item:hover {
          border-color: #334155;
          background: #111f36;
        }
        .dark .quick-arrow { color: #475569; }
        .dark .quick-item:hover .quick-arrow { color: #5eead4; }

        .dark .info {
          background: linear-gradient(135deg, rgba(15,118,110,0.12), rgba(21,128,61,0.1));
          border-color: rgba(94,234,212,0.25);
        }
        .dark .info-text { color: #5eead4; }
        .dark .info-text strong { color: #99f6e4; }
      `}</style>
    </main>
  );
}
