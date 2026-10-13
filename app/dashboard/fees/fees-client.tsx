"use client";

import { useState } from "react";
import Link from "next/link";

type Student = {
  id: number;
  name: string;
  student_id: string | null;
  class_name: string;
  section: string | null;
  roll: string | null;
  monthly_fee: number;
  discount: number;
};

function toBangla(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

export default function FeesClient({ students }: { students: Student[] }) {
  const [classFilter, setClassFilter] = useState("");
  const [search, setSearch] = useState("");

  const classes = Array.from(new Set(students.map((s) => s.class_name)));

  const filteredStudents = students.filter((s) => {
    if (classFilter && s.class_name !== classFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.student_id || "").toLowerCase().includes(q) ||
        (s.roll || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 pb-4">
      {/* শিরোনাম */}
      <div className="mb-4">
        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
          বেতন আদায়
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          যার বেতন নিতে চান, তার নামে ট্যাপ করুন
        </p>
      </div>

      {/* ফিল্টার */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-3 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, আইডি বা রোল দিয়ে খুঁজুন..."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
        >
          <option value="">সব শ্রেণি</option>
          {classes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mb-2 text-xs text-slate-500 dark:text-slate-400 text-center">
        {toBangla(filteredStudents.length)} জন শিক্ষার্থী
      </div>

      {/* ============ মোবাইল: কার্ড ============ */}
      <div className="md:hidden space-y-2 mb-4">
        {filteredStudents.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500 text-sm border border-slate-200 dark:border-slate-800">
            কোনো শিক্ষার্থী নেই
          </div>
        ) : (
          filteredStudents.map((s) => {
            const payableAmt = Number(s.monthly_fee) - Number(s.discount || 0);
            return (
              <Link
                key={s.id}
                href={`/dashboard/fees/pay/${s.id}`}
                className="block bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:border-brand-400 hover:shadow-md transition active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white truncate mb-1">
                      {s.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500">
                      <span className="font-medium">{s.class_name}</span>
                      {s.section && <span>• {s.section}</span>}
                      {s.roll && <span>• রোল {s.roll}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400 mb-0.5">মাসিক বেতন</div>
                    <div className="text-[15px] font-bold text-brand-600">
                      ৳{toBangla(payableAmt)}
                    </div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
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
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-500">কোনো শিক্ষার্থী নেই</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">আইডি</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">নাম</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">শ্রেণি</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">রোল</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs">মাসিক বেতন</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 text-xs">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const payableAmt = Number(s.monthly_fee) - Number(s.discount || 0);
                  return (
                    <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 text-slate-500 text-xs">{s.student_id || "-"}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{s.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {s.class_name}
                        {s.section && ` (${s.section})`}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.roll || "-"}</td>
                      <td className="px-4 py-3 text-right font-bold text-brand-600">
                        ৳{toBangla(payableAmt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/dashboard/fees/pay/${s.id}`}
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
