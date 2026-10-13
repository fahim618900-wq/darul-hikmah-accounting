"use client";

import { useState } from "react";
import Link from "next/link";

type Student = {
  id: number;
  student_id: string | null;
  name: string;
  class_name: string;
  section: string | null;
  roll: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  address: string | null;
  admission_date: string | null;
  monthly_fee: number;
  discount: number;
  discount_reason: string | null;
  status: string;
};

type Payment = {
  id: number;
  month: number;
  year: number;
  amount: number;
  payment_date: string;
  receipt_no: string | null;
  payment_method: string;
  note: string | null;
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

function toBangla(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())}`;
}

function paymentMethodLabel(method: string): string {
  switch (method) {
    case "cash": return "নগদ";
    case "bkash": return "বিকাশ";
    case "nagad": return "নগদ (Nagad)";
    case "bank": return "ব্যাংক";
    default: return "অন্যান্য";
  }
}

export default function StudentProfile({
  student,
  payments,
}: {
  student: Student;
  payments: Payment[];
}) {
  const [tab, setTab] = useState<"overview" | "payments">("overview");

  const payable = Number(student.monthly_fee) - Number(student.discount || 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  // চলতি মাসের হিসাব
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentMonthPaid = payments
    .filter((p) => p.month === currentMonth && p.year === currentYear)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const currentMonthDue = Math.max(0, payable - currentMonthPaid);

  // মাসভিত্তিক ইতিহাস (সর্বশেষ আগে)
  const monthlyHistory = Object.entries(
    payments.reduce((acc, p) => {
      const key = `${p.year}-${String(p.month).padStart(2, "0")}`;
      if (!acc[key]) acc[key] = { month: p.month, year: p.year, paid: 0, count: 0 };
      acc[key].paid += Number(p.amount);
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { month: number; year: number; paid: number; count: number }>)
  )
    .map(([_, v]) => v)
    .sort((a, b) => b.year - a.year || b.month - a.month);

  const isActive = student.status === "active";

  return (
    <>
      {/* ============ ফিরে যাওয়ার বাটন ============ */}
      <div className="no-print max-w-5xl mx-auto px-3 sm:px-4 pt-4">
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-medium mb-4 hover:gap-3 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          শিক্ষার্থী তালিকায় ফিরে যান
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        {/* ============ হেডার কার্ড ============ */}
        <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-purple-700 rounded-3xl p-5 sm:p-6 mb-4 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 border border-white/30">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold mb-1 truncate">
                  {student.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm opacity-90">
                  <span className="font-medium">{student.class_name}</span>
                  {student.section && <span>• {student.section}</span>}
                  {student.roll && <span>• রোল {student.roll}</span>}
                  {student.student_id && <span>• আইডি {student.student_id}</span>}
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${isActive ? "bg-emerald-400/30 text-emerald-100 border border-emerald-300/40" : "bg-red-400/30 text-red-100 border border-red-300/40"}`}>
              {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
            </span>
          </div>

          {/* দ্রুত সামারি */}
          <div className="relative grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/20">
            <div>
              <div className="text-[10px] opacity-75 mb-0.5">মাসিক বেতন</div>
              <div className="text-base sm:text-lg font-bold">৳{toBangla(student.monthly_fee)}</div>
            </div>
            <div className="border-x border-white/20">
              <div className="text-[10px] opacity-75 mb-0.5">ছাড়</div>
              <div className="text-base sm:text-lg font-bold">৳{toBangla(student.discount || 0)}</div>
            </div>
            <div>
              <div className="text-[10px] opacity-75 mb-0.5">প্রদেয়</div>
              <div className="text-base sm:text-lg font-bold">৳{toBangla(payable)}</div>
            </div>
          </div>
        </div>

        {/* ============ ট্যাব ============ */}
        <div className="no-print flex gap-2 mb-4 bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setTab("overview")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              tab === "overview"
                ? "bg-brand-600 text-white shadow-md shadow-brand-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            সংক্ষিপ্ত তথ্য
          </button>
          <button
            onClick={() => setTab("payments")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
              tab === "payments"
                ? "bg-brand-600 text-white shadow-md shadow-brand-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            পেমেন্ট
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab === "payments" ? "bg-white/25" : "bg-slate-100 dark:bg-slate-800"}`}>
              {toBangla(payments.length)}
            </span>
          </button>
        </div>

        {/* ============ ট্যাব কনটেন্ট ============ */}
        {tab === "overview" ? (
          <div className="space-y-4">
            {/* চলতি মাসের হিসাব */}
            <Card title="চলতি মাসের হিসাব" subtitle={`${MONTHS[currentMonth - 1]} ${toBangla(currentYear)}`}>
              <div className="grid grid-cols-3 gap-3">
                <StatBox label="প্রাপ্য" value={payable} color="brand" />
                <StatBox label="জমা" value={currentMonthPaid} color="emerald" />
                <StatBox label="বাকি" value={currentMonthDue} color={currentMonthDue > 0 ? "red" : "slate"} />
              </div>
            </Card>

            {/* অভিভাবকের তথ্য */}
            <Card title="অভিভাবকের তথ্য" icon="family">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow label="নাম" value={student.guardian_name || "-"} />
                <InfoRow label="মোবাইল" value={student.guardian_phone || "-"} />
                {student.address && (
                  <div className="sm:col-span-2">
                    <InfoRow label="ঠিকানা" value={student.address} />
                  </div>
                )}
              </div>
            </Card>

            {/* অন্যান্য তথ্য */}
            <Card title="অন্যান্য তথ্য" icon="info">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow label="শিক্ষার্থী আইডি" value={student.student_id || "-"} />
                <InfoRow label="ভর্তি তারিখ" value={student.admission_date ? formatDate(student.admission_date) : "-"} />
                {student.discount_reason && (
                  <div className="sm:col-span-2">
                    <InfoRow label="ছাড়ের কারণ" value={student.discount_reason} />
                  </div>
                )}
              </div>
            </Card>

            {/* সারসংক্ষেপ */}
            <Card title="সারসংক্ষেপ">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4 border border-brand-100 dark:border-brand-900/40">
                  <div className="text-xs text-brand-700 dark:text-brand-400 mb-1">মোট পেমেন্ট</div>
                  <div className="text-xl font-bold text-brand-700 dark:text-brand-400">
                    {toBangla(payments.length)} বার
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/40">
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">মোট পরিশোধিত</div>
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                    ৳{toBangla(totalPaid)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <Card>
                <div className="text-center py-8 text-slate-500">
                  <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                  <p className="text-sm">এখনো কোনো বেতন পরিশোধ হয়নি</p>
                </div>
              </Card>
            ) : (
              <>
                {/* মোবাইলে কার্ড */}
                <div className="md:hidden space-y-2.5">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
                            {MONTHS[p.month - 1]} {toBangla(p.year)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {formatDate(p.payment_date)} • {paymentMethodLabel(p.payment_method)}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-base font-bold text-emerald-600">
                            ৳{toBangla(p.amount)}
                          </div>
                        </div>
                      </div>

                      {p.receipt_no && (
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 mb-3">
                          <div className="text-[10px] text-slate-500 mb-0.5">রসিদ নম্বর</div>
                          <div className="text-[11px] font-mono font-semibold text-brand-600 dark:text-brand-400 break-all">
                            {p.receipt_no}
                          </div>
                        </div>
                      )}

                      {p.note && (
                        <div className="text-[11px] text-slate-500 mb-3 italic">নোট: {p.note}</div>
                      )}

                      <Link
                        href={`/dashboard/fees/receipt?id=${p.id}`}
                        className="w-full py-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-semibold hover:bg-brand-100 transition flex items-center justify-center gap-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        রসিদ দেখুন
                      </Link>
                    </div>
                  ))}
                </div>

                {/* ডেস্কটপে টেবিল */}
                <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">মাস</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">তারিখ</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">পরিমাণ</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">পদ্ধতি</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">রসিদ নম্বর</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">রসিদ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                              {MONTHS[p.month - 1]} {toBangla(p.year)}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                              {formatDate(p.payment_date)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600">
                              ৳{toBangla(p.amount)}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                              {paymentMethodLabel(p.payment_method)}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-brand-600 dark:text-brand-400">
                              {p.receipt_no || "-"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Link
                                href={`/dashboard/fees/receipt?id=${p.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-medium hover:bg-brand-100 transition"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                                দেখুন
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-t-2 border-brand-600">
                          <td colSpan={2} className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                            সর্বমোট:
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600 text-base">
                            ৳{toBangla(totalPaid)}
                          </td>
                          <td colSpan={3}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ==================== সহায়ক কম্পোনেন্ট ==================== */

function Card({
  title,
  subtitle,
  icon,
  children,
}: {
  title?: string;
  subtitle?: string;
  icon?: "family" | "info";
  children: React.ReactNode;
}) {
  const icons = {
    family: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    info: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {title && (
        <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          {icon && (
            <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              {icons[icon]}
            </span>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-3 py-2 border-b border-dotted border-slate-200 dark:border-slate-700 last:border-b-0">
      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white text-right break-words">
        {value}
      </span>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "brand" | "emerald" | "red" | "slate";
}) {
  const styles = {
    brand: { bg: "bg-brand-50 dark:bg-brand-900/20", border: "border-brand-100 dark:border-brand-900/40", text: "text-brand-700 dark:text-brand-400" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-100 dark:border-emerald-900/40", text: "text-emerald-700 dark:text-emerald-400" },
    red: { bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-100 dark:border-red-900/40", text: "text-red-700 dark:text-red-400" },
    slate: { bg: "bg-slate-50 dark:bg-slate-800", border: "border-slate-100 dark:border-slate-700", text: "text-slate-500" },
  };
  const s = styles[color];

  return (
    <div className={`${s.bg} ${s.border} border rounded-2xl p-3 text-center`}>
      <div className={`text-[10px] ${s.text} mb-1 opacity-80`}>{label}</div>
      <div className={`text-base font-bold ${s.text}`}>৳{toBangla(value)}</div>
    </div>
  );
}
