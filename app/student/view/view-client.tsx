"use client";

import { useEffect, useState } from "react";
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
  address: string | null;
  admission_date: string | null;
  monthly_fee: number;
  discount: number;
  status: string;
  photo_url: string | null;
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

function todayBangla(): string {
  const d = new Date();
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

export default function StudentView() {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Record<number, Payment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preparedBy, setPreparedBy] = useState("");

  useEffect(() => {
    async function load() {
      const idsRaw = localStorage.getItem("student_portal_ids");
      if (!idsRaw) {
        window.location.href = "/student";
        return;
      }

      const ids: number[] = JSON.parse(idsRaw);
      if (!ids.length) {
        window.location.href = "/student";
        return;
      }

      const { data: studentData, error: studentErr } = await supabase
        .from("students")
        .select("*")
        .in("id", ids);

      if (studentErr) {
        setError(studentErr.message);
        setLoading(false);
        return;
      }

      setStudents(studentData || []);

      const { data: paymentData, error: payErr } = await supabase
        .from("fee_payments")
        .select("*")
        .in("student_id", ids)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (payErr) {
        setError(payErr.message);
        setLoading(false);
        return;
      }

      const grouped: Record<number, Payment[]> = {};
      (paymentData || []).forEach((p) => {
        if (!grouped[p.student_id]) grouped[p.student_id] = [];
        grouped[p.student_id].push(p);
      });

      setPayments(grouped);
      setLoading(false);
    }

    load();
  }, []);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-700 text-sm">সমস্যা: {error}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500">কোনো তথ্য পাওয়া যায়নি।</p>
      </div>
    );
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // বকেয়া নোটিফিকেশন
  const dueNotifications = students
    .map((s) => {
      const sp = payments[s.id] || [];
      const monthPayments = sp.filter((p) => p.month === currentMonth && p.year === currentYear);
      const paid = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const payable = Number(s.monthly_fee) - Number(s.discount || 0);
      const due = payable - paid;
      return { student: s, due };
    })
    .filter((x) => x.due > 0);

  const totalDue = dueNotifications.reduce((sum, x) => sum + x.due, 0);

  return (
    <>
      {/* ============ স্ক্রিনে কন্ট্রোল ============ */}
      <div className="no-print">
        {/* বকেয়া নোটিফিকেশন */}
        {dueNotifications.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/40 p-4 rounded-2xl mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-1">
                  {MONTHS[currentMonth - 1]} {toBangla(currentYear)} মাসের বেতন বাকি
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-400">
                  {dueNotifications.length === 1 && dueNotifications[0].student.id === students[0].id ? (
                    <>আপনার এই মাসের বেতন <strong>৳{toBangla(totalDue)}</strong> বাকি আছে।</>
                  ) : (
                    <>{toBangla(dueNotifications.length)} জনের মোট বাকি <strong>৳{toBangla(totalDue)}</strong></>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* প্রস্তুতকারীর নাম + প্রিন্ট বাটন */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              প্রস্তুতকারীর নাম (প্রিন্টে দেখাবে)
            </label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="আপনার নাম"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/25 transition flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / PDF
          </button>
        </div>
      </div>

      {/* ============ প্রিন্ট হেডার ============ */}
      <div className="print-area">
        <div className="hidden print:block" style={{ marginBottom: "16px" }}>
          <div style={{ textAlign: "center", marginBottom: "12px" }}>
            <h1 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f766e", marginBottom: "4px" }}>
              দারুল হিকমাহ মডেল মাদ্রাসা
            </h1>
            <p style={{ fontSize: "11px", color: "#475569" }}>
              ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "12px" }}>
            <div><strong>বিষয়:</strong> শিক্ষার্থীর তথ্য ও বেতন ইতিহাস</div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "16px" }}>
            <div><strong>মোট শিক্ষার্থী:</strong> {toBangla(students.length)} জন</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        {/* ============ শিক্ষার্থীদের কার্ড/টেবিল ============ */}
        {students.map((s) => {
          const studentPayments = payments[s.id] || [];
          const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
          const payable = Number(s.monthly_fee) - Number(s.discount || 0);

          return (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4 print:border-0 print:shadow-none print:rounded-none"
            >
              {/* হেডার কার্ড (স্ক্রিনে) */}
              <div className="bg-gradient-to-br from-brand-600 to-purple-700 p-5 print:bg-none print:p-0">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/40 print:border-slate-300">
                    {s.photo_url ? (
                      <img
                        src={s.photo_url}
                        alt={s.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white print:text-slate-700 font-bold text-2xl">
                        {s.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-white print:text-slate-900 mb-1 truncate">
                      {s.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/90 print:text-slate-600">
                      <span className="font-medium">{s.class_name}</span>
                      {s.section && <span>• শাখা: {s.section}</span>}
                      {s.roll && <span>• রোল: {s.roll}</span>}
                      {s.student_id && <span>• আইডি: {s.student_id}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* তথ্য ও হিসাব */}
              <div className="p-5">
                {/* অভিভাবক তথ্য */}
                {(s.guardian_name || s.guardian_phone || s.address) && (
                  <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider">
                      অভিভাবকের তথ্য
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {s.guardian_name && (
                        <div>
                          <div className="text-[10px] text-slate-400">নাম</div>
                          <div className="font-medium text-slate-700 dark:text-slate-300">{s.guardian_name}</div>
                        </div>
                      )}
                      {s.guardian_phone && (
                        <div>
                          <div className="text-[10px] text-slate-400">মোবাইল</div>
                          <div className="font-medium text-slate-700 dark:text-slate-300">{s.guardian_phone}</div>
                        </div>
                      )}
                      {s.address && (
                        <div className="col-span-2">
                          <div className="text-[10px] text-slate-400">ঠিকানা</div>
                          <div className="font-medium text-slate-700 dark:text-slate-300">{s.address}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* বেতনের সারসংক্ষেপ */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">মাসিক বেতন</div>
                    <div className="text-base font-bold text-slate-700 dark:text-slate-300">৳{toBangla(payable)}</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 text-center">
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mb-1">মোট পরিশোধিত</div>
                    <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">৳{toBangla(totalPaid)}</div>
                  </div>
                  <div className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-3 text-center">
                    <div className="text-[10px] text-brand-700 dark:text-brand-400 mb-1">মোট পেমেন্ট</div>
                    <div className="text-base font-bold text-brand-700 dark:text-brand-400">{toBangla(studentPayments.length)} বার</div>
                  </div>
                </div>

                {/* বেতন ইতিহাস */}
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider">
                  বেতন পরিশোধের ইতিহাস
                </h3>

                {studentPayments.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <p className="text-slate-500 text-xs">এখনো কোনো বেতন পরিশোধ হয়নি</p>
                  </div>
                ) : (
                  <>
                    {/* স্ক্রিনে টেবিল */}
                    <div className="overflow-x-auto print:hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300 text-[11px]">মাস</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300 text-[11px]">বছর</th>
                            <th className="px-3 py-2 text-right font-semibold text-slate-600 dark:text-slate-300 text-[11px]">পরিমাণ</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300 text-[11px]">তারিখ</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300 text-[11px]">রসিদ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentPayments.map((p) => (
                            <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                              <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{MONTHS[p.month - 1]}</td>
                              <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{toBangla(p.year)}</td>
                              <td className="px-3 py-2 text-right font-bold text-emerald-600">৳{toBangla(p.amount)}</td>
                              <td className="px-3 py-2 text-slate-500 text-[10px]">{formatDate(p.payment_date)}</td>
                              <td className="px-3 py-2 text-brand-600 text-[10px] font-mono">{p.receipt_no || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 dark:bg-slate-800">
                            <td colSpan={2} className="px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-300 text-[11px]">সর্বমোট:</td>
                            <td className="px-3 py-2 text-right font-bold text-emerald-600 text-sm">৳{toBangla(totalPaid)}</td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* প্রিন্ট-অনলি টেবিল */}
                    <table className="hidden print:table w-full border-collapse text-xs">
                      <thead>
                        <tr style={{ background: "#0f766e", color: "#ffffff" }}>
                          <th style={{ border: "1px solid #999", padding: "5px" }}>নং</th>
                          <th style={{ border: "1px solid #999", padding: "5px" }}>মাস</th>
                          <th style={{ border: "1px solid #999", padding: "5px" }}>বছর</th>
                          <th style={{ border: "1px solid #999", padding: "5px" }}>পরিশোধের তারিখ</th>
                          <th style={{ border: "1px solid #999", padding: "5px" }}>রসিদ নম্বর</th>
                          <th style={{ border: "1px solid #999", padding: "5px" }}>পদ্ধতি</th>
                          <th style={{ border: "1px solid #999", padding: "5px", textAlign: "right" }}>পরিমাণ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentPayments.map((p, i) => (
                          <tr key={p.id}>
                            <td style={{ border: "1px solid #999", padding: "4px" }}>{toBangla(i + 1)}</td>
                            <td style={{ border: "1px solid #999", padding: "4px" }}>{MONTHS[p.month - 1]}</td>
                            <td style={{ border: "1px solid #999", padding: "4px" }}>{toBangla(p.year)}</td>
                            <td style={{ border: "1px solid #999", padding: "4px" }}>{formatDate(p.payment_date)}</td>
                            <td style={{ border: "1px solid #999", padding: "4px", fontSize: "9px" }}>{p.receipt_no || "-"}</td>
                            <td style={{ border: "1px solid #999", padding: "4px" }}>{paymentMethodLabel(p.payment_method)}</td>
                            <td style={{ border: "1px solid #999", padding: "4px", textAlign: "right" }}>৳ {toBangla(p.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: "#f1f5f9", fontWeight: "bold" }}>
                          <td colSpan={6} style={{ border: "1px solid #999", padding: "5px", textAlign: "right" }}>সর্বমোট:</td>
                          <td style={{ border: "1px solid #999", padding: "5px", textAlign: "right" }}>৳ {toBangla(totalPaid)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* স্বাক্ষর */}
        <div className="hidden print:flex justify-between mt-12 pt-2">
          <div style={{ textAlign: "center", minWidth: "150px" }}>
            <div style={{ borderTop: "1px solid #475569", paddingTop: "4px", fontSize: "11px" }}>
              অভিভাবকের স্বাক্ষর
            </div>
          </div>
          <div style={{ textAlign: "center", minWidth: "150px" }}>
            <div style={{ borderTop: "1px solid #475569", paddingTop: "4px", fontSize: "11px" }}>
              {preparedBy || "প্রস্তুতকারীর স্বাক্ষর"}
            </div>
          </div>
        </div>

        {/* সতর্কবার্তা (প্রিন্টের নিচে) */}
        <div className="hidden print:block mt-6 text-center text-[9px] text-slate-500">
          এই রিপোর্টটি কম্পিউটার দ্বারা স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।
        </div>
      </div>

      {/* স্ক্রিনে সতর্কবার্তা */}
      <div className="no-print bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-200 dark:border-red-800/40 mt-4">
        <div className="flex gap-2 items-start">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-[11px] text-red-700 dark:text-red-400 leading-relaxed">
            <strong>সতর্কবার্তা:</strong> এই পোর্টালে শুধু নিজের ও ভাই/বোনের তথ্য দেখা যাবে। অন্যের তথ্য দেখার চেষ্টা করলে আপনার অ্যাক্সেস বন্ধ হয়ে যাবে এবং মাদ্রাসা কর্তৃপক্ষ দায়ী থাকবে না।
          </p>
        </div>
      </div>
    </>
  );
}
