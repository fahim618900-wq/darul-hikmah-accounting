import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function formatTaka(amount: number) {
  return "৳ " + amount.toLocaleString("bn-BD");
}

// --- SVG Icons ---
type IconProps = { color?: string; size?: number };

const StudentsIcon = ({ color = "#0f766e", size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PayableIcon = ({ color = "#1e40af", size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="15" x2="10" y2="15" />
  </svg>
);

const CollectedIcon = ({ color = "#15803d", size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12l3 3 5-6" />
  </svg>
);

const DueIcon = ({ color = "#b91c1c", size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="16" r="0.6" fill={color} />
  </svg>
);

const IncomeIcon = ({ color = "#15803d", size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="15 7 21 7 21 13" />
  </svg>
);

const ExpenseIcon = ({ color = "#b91c1c", size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 7 9 13 13 9 21 17" />
    <polyline points="15 17 21 17 21 11" />
  </svg>
);

const BalanceIcon = ({ color = "#0f766e", size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18" />
    <path d="M5 7h14" />
    <path d="M5 7l-3 6a3 3 0 0 0 6 0z" />
    <path d="M19 7l-3 6a3 3 0 0 0 6 0z" />
  </svg>
);

const PaidIcon = ({ color = "#7c3aed", size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // মোট সক্রিয় শিক্ষার্থী
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("is_deleted", false);

  // চলতি মাসের প্রাপ্য বেতন
  const { data: students } = await supabase
    .from("students")
    .select("monthly_fee, discount")
    .eq("status", "active")
    .eq("is_deleted", false);

  const totalPayable =
    students?.reduce((sum, s) => {
      const fee = Number(s.monthly_fee || 0);
      const discount = Number(s.discount || 0);
      return sum + (fee - discount);
    }, 0) || 0;

  // চলতি মাসে আদায়কৃত বেতন
  const { data: payments } = await supabase
    .from("fee_payments")
    .select("amount")
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .eq("is_deleted", false);

  const totalCollected =
    payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

  const totalDue = totalPayable - totalCollected;

  // চলতি মাসের অন্যান্য আয়
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

  // চলতি মাসের ব্যয়
  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount")
    .gte("entry_date", monthStart)
    .lte("entry_date", monthEnd)
    .eq("is_deleted", false);

  const totalExpense =
    expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;

  const balance = totalIncome + totalCollected - totalExpense;

  // Paid/Unpaid সংখ্যা
  const { data: paidStudents } = await supabase
    .from("fee_payments")
    .select("student_id")
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .eq("is_deleted", false);

  const paidStudentIds = new Set<string>();
  paidStudents?.forEach((p) => p.student_id && paidStudentIds.add(p.student_id));
  const paidCount = paidStudentIds.size;
  const unpaidCount = (studentCount || 0) - paidCount;

  const stats = [
    { label: "মোট শিক্ষার্থী", value: studentCount || 0, suffix: "জন", color: "#0f766e", link: "/dashboard/students", Icon: StudentsIcon },
    { label: "চলতি মাসের প্রাপ্য বেতন", value: formatTaka(totalPayable), color: "#1e40af", link: "/dashboard/reports", Icon: PayableIcon },
    { label: "চলতি মাসে আদায়", value: formatTaka(totalCollected), color: "#15803d", link: "/dashboard/reports", Icon: CollectedIcon },
    { label: "চলতি মাসের বাকি", value: formatTaka(totalDue), color: "#b91c1c", link: "/dashboard/reports", Icon: DueIcon },
    { label: "মোট আয় (চলতি মাস)", value: formatTaka(totalIncome), color: "#15803d", link: "/dashboard/income", Icon: IncomeIcon },
    { label: "মোট ব্যয় (চলতি মাস)", value: formatTaka(totalExpense), color: "#b91c1c", link: "/dashboard/expenses", Icon: ExpenseIcon },
    { label: "ব্যালেন্স", value: formatTaka(balance), color: "#0f766e", link: "/dashboard/reports", Icon: BalanceIcon },
    { label: "Paid / Unpaid", value: `${paidCount} / ${unpaidCount}`, suffix: "জন", color: "#7c3aed", link: "/dashboard/reports", Icon: PaidIcon },
  ];

  const monthName = now.toLocaleString("bn-BD", { month: "long" });

  return (
    <main className="dashboard-wrap">
      <style>{`
        .dashboard-wrap {
          padding: 1.25rem 0.9rem 2.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .dash-header {
          margin-bottom: 1.25rem;
        }
        .dash-header h2 {
          font-size: 1.35rem;
          color: #0f766e;
          margin: 0 0 0.2rem 0;
        }
        .dash-header p {
          color: #64748b;
          font-size: 0.85rem;
          margin: 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.7rem;
        }
        .stat-card {
          background: #ffffff;
          padding: 0.85rem 0.9rem;
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.07);
          text-decoration: none;
          border-left: 4px solid;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          min-height: 92px;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.10);
        }
        .stat-icon-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .stat-label {
          color: #64748b;
          font-size: 0.75rem;
          line-height: 1.25;
          font-weight: 500;
        }
        .stat-value {
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1.2;
          word-break: break-word;
        }
        .stat-suffix {
          font-size: 0.75rem;
          margin-left: 0.2rem;
          color: #64748b;
          font-weight: 500;
        }
        .dash-footer {
          margin-top: 1.5rem;
          background: #ffffff;
          padding: 1rem 1.1rem;
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.07);
        }
        .dash-footer p {
          color: #64748b;
          font-size: 0.82rem;
          margin: 0;
        }

        @media (min-width: 640px) {
          .dashboard-wrap { padding: 1.75rem 1.25rem 3rem; }
          .dash-header h2 { font-size: 1.5rem; }
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
          }
          .stat-card {
            padding: 1.1rem 1.15rem;
            min-height: 110px;
            gap: 0.65rem;
          }
          .stat-label { font-size: 0.82rem; }
          .stat-value { font-size: 1.25rem; }
          .stat-suffix { font-size: 0.85rem; }
        }

        @media (min-width: 1024px) {
          .stat-value { font-size: 1.35rem; }
        }
      `}</style>

      <div className="dash-header">
        <h2>ড্যাশবোর্ড</h2>
        <p>
          {monthName} {currentYear} — চলতি মাসের সারসংক্ষেপ
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => {
          const { Icon } = stat;
          return (
            <Link
              key={stat.label}
              href={stat.link}
              className="stat-card"
              style={{ borderLeftColor: stat.color }}
            >
              <div className="stat-icon-row">
                <Icon color={stat.color} size={20} />
                <span className="stat-label">{stat.label}</span>
              </div>
              <p className="stat-value" style={{ color: stat.color, margin: 0 }}>
                {stat.value}
                {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="dash-footer">
        <p>
          উপরের যেকোনো কার্ডে ক্লিক করে বিস্তারিত দেখতে পারবেন। বিস্তারিত ফিচার শীঘ্রই যোগ করা হবে।
        </p>
      </div>
    </main>
  );
}
