"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: number;
  name: string;
  student_id: string | null;
  class_name: string;
  section: string | null;
  roll: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  monthly_fee: number;
  discount: number;
};

type Payment = {
  student_id: number;
  amount: number;
  month: number;
  year: number;
  payment_date: string;
};

type Row = {
  student: Student;
  payable: number;
  paid: number;
  due: number;
  status: "paid" | "unpaid" | "partial";
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

function statusColor(s: "paid" | "unpaid" | "partial") {
  if (s === "paid") return { bg: "#dcfce7", text: "#15803d", border: "#86efac", label: "Paid" };
  if (s === "unpaid") return { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5", label: "Unpaid" };
  return { bg: "#fef3c7", text: "#b45309", border: "#fcd34d", label: "Partial" };
}

export default function FeesClient({ students }: { students: Student[] }) {
  const supabase = createClient();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid" | "partial">("all");
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  // পেমেন্ট লোড — মাস অনুযায়ী
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("fee_payments")
        .select("student_id, amount, month, year, payment_date")
        .eq("month", month)
        .eq("year", year);
      setPayments(data || []);
      setLoading(false);
    }
    load();
  }, [month, year]);

  const classes = Array.from(new Set(students.map((s) => s.class_name)));

  // ছাত্রভিত্তিক হিসাব
  const rows: Row[] = useMemo(() => {
    return students.map((s) => {
      const sp = payments.filter((p) => p.student_id === s.id);
      const paid = sp.reduce((sum, p) => sum + Number(p.amount), 0);
      const payable = Number(s.monthly_fee || 0) - Number(s.discount || 0);
      const due = payable - paid;

      let status: "paid" | "unpaid" | "partial";
      if (paid >= payable && payable > 0) status = "paid";
      else if (paid === 0) status = "unpaid";
      else status = "partial";

      return { student: s, payable, paid, due, status };
    });
  }, [students, payments]);

  const filtered = rows.filter((r) => {
    if (classFilter && r.student.class_name !== classFilter) return false;
    if (statusFilter === "paid" && r.status !== "paid") return false;
    if (statusFilter === "unpaid" && r.status === "paid") return false;
    if (statusFilter === "partial" && r.status !== "partial") return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.student.name.toLowerCase().includes(q) ||
        (r.student.student_id || "").toLowerCase().includes(q) ||
        (r.student.roll || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const paidCount = rows.filter((r) => r.status === "paid").length;
  const partialCount = rows.filter((r) => r.status === "partial").length;
  const unpaidCount = rows.filter((r) => r.status === "unpaid").length;
  const totalPayable = rows.reduce((s, r) => s + r.payable, 0);
  const totalPaid = rows.reduce((s, r) => s + r.paid, 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-5 pb-4">
      {/* শিরোনাম */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          বেতন আদায়
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {MONTHS[month - 1]} {toBangla(year)} — মাসের বেতন অবস্থা ও আদায়
        </p>
      </div>

      {/* মাস ও বছর নির্বাচন */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-3 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">মাস</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">বছর</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* সারাংশ কার্ড */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
        <SummaryCard label="মোট শিক্ষার্থী" value={toBangla(students.length)} suffix="জন" color="#2563eb" />
        <SummaryCard label="Paid" value={toBangla(paidCount)} suffix="জন" color="#15803d" />
        <SummaryCard label="Partial" value={toBangla(partialCount)} suffix="জন" color="#b45309" />
        <SummaryCard label="Unpaid" value={toBangla(unpaidCount)} suffix="জন" color="#b91c1c" />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <MoneyCard label="মোট প্রাপ্য" value={totalPayable} color="#1e40af" />
        <MoneyCard label="আদায়" value={totalPaid} color="#15803d" />
        <MoneyCard label="বাকি" value={totalPayable - totalPaid} color="#b91c1c" />
      </div>

      {/* ফিল্টার */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম / আইডি / রোল..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="">সব শ্রেণি</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">সব স্ট্যাটাস</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      <div className="mb-2 text-xs text-slate-500 dark:text-slate-400 text-center">
        {toBangla(filtered.length)} জন শিক্ষার্থী — যার বেতন নিতে চান, তার নামে ট্যাপ করুন
      </div>

      {/* ============ মোবাইল: কার্ড ============ */}
      <div className="md:hidden space-y-2.5 mb-4">
        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500 text-sm border border-slate-200 dark:border-slate-800">
            কোনো শিক্ষার্থী নেই
          </div>
        ) : (
          filtered.map((r) => {
            const sc = statusColor(r.status);
            return (
              <Link
                key={r.student.id}
                href={`/dashboard/fees/pay/${r.student.id}`}
                className="block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-400 transition active:scale-[0.99]"
                style={{ borderLeftWidth: "4px", borderLeftColor: sc.text }}
              >
                {/* হেডার */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white truncate mb-1">
                        {r.student.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500">
                        <span className="font-medium">{r.student.class_name}</span>
                        {r.student.section && <span>• {r.student.section}</span>}
                        {r.student.roll && <span>• রোল {r.student.roll}</span>}
                        {r.student.student_id && <span>• {r.student.student_id}</span>}
                      </div>
                      {r.student.guardian_phone && (
                        <div className="text-[11px] text-slate-500 mt-1">
                          📞 {r.student.guardian_phone}
                        </div>
                      )}
                    </div>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                      style={{
                        background: sc.bg,
                        color: sc.text,
                        border: `1px solid ${sc.border}`,
                      }}
                    >
                      {sc.label}
                    </span>
                  </div>

                  {/* টাকার হিসাব */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 text-center">
                      <div className="text-[10px] text-slate-500 mb-0.5">প্রদেয়</div>
                      <div className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                        ৳{toBangla(r.payable)}
                      </div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2.5 text-center">
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mb-0.5">জমা</div>
                      <div className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">
                        ৳{toBangla(r.paid)}
                      </div>
                    </div>
                    <div className={`rounded-xl p-2.5 text-center ${r.due > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-slate-50 dark:bg-slate-800"}`}>
                      <div className={`text-[10px] mb-0.5 ${r.due > 0 ? "text-red-700 dark:text-red-400" : "text-slate-500"}`}>
                        বাকি
                      </div>
                      <div className={`text-[13px] font-bold ${r.due > 0 ? "text-red-700 dark:text-red-400" : "text-slate-400"}`}>
                        ৳{toBangla(r.due)}
                      </div>
                    </div>
                  </div>

                  {/* ছাড় তথ্য */}
                  {r.student.discount > 0 && (
                    <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400">
                      ছাড়: ৳{toBangla(r.student.discount)} ({r.student.guardian_name || ""})
                    </div>
                  )}
                </div>

                {/* বাটন */}
                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">বেতন নিতে ট্যাপ করুন</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* ============ ডেস্কটপ: টেবিল ============ */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">কোনো শিক্ষার্থী নেই</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">আইডি</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">নাম</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">শ্রেণি</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">রোল</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">প্রদেয়</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">জমা</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">বাকি</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const sc = statusColor(r.status);
                  return (
                    <tr key={r.student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 text-xs text-slate-500">{r.student.student_id || "-"}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {r.student.name}
                        {r.student.guardian_phone && (
                          <div className="text-[10px] text-slate-400">📞 {r.student.guardian_phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                        {r.student.class_name}
                        {r.student.section && ` (${r.student.section})`}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.student.roll || "-"}</td>
                      <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">৳{toBangla(r.payable)}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-700">৳{toBangla(r.paid)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${r.due > 0 ? "text-red-700" : "text-slate-400"}`}>
                        ৳{toBangla(r.due)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold"
                          style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/dashboard/fees/pay/${r.student.id}`}
                          className="inline-block px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition"
                        >
                          বেতন নিন
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  suffix,
  color,
}: {
  label: string;
  value: string;
  suffix: string;
  color: string;
}) {
  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 shadow-sm"
      style={{ borderLeftWidth: "3px", borderLeftColor: color }}
    >
      <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">{label}</div>
      <div className="text-base sm:text-lg font-bold" style={{ color }}>
        {value}
        <span className="text-[10px] sm:text-xs font-normal text-slate-500 ml-1">{suffix}</span>
      </div>
    </div>
  );
}

function MoneyCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 shadow-sm"
      style={{ borderLeftWidth: "3px", borderLeftColor: color }}
    >
      <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mb-0.5 truncate">{label}</div>
      <div className="text-sm sm:text-base font-bold" style={{ color }}>
        ৳{toBangla(value)}
      </div>
    </div>
  );
}
