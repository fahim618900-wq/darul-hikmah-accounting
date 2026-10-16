"use client";

import { useState, useMemo } from "react";

type Student = {
  id: number;
  name: string;
  class_name: string;
  roll: string | null;
  section: string | null;
  photo_url: string | null;
};

type MadrasahEvent = {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_closed: boolean;
};

type EventStudentFee = {
  id: number;
  event_id: number;
  student_id: number;
  payable_amount: number;
  discount: number;
  discount_reason: string | null;
  students: Student | null;
};

type EventPayment = {
  id: number;
  event_id: number;
  student_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  receipt_no: string | null;
};

function toBangla(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

function todayBangla(): string {
  const d = new Date();
  return `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())}`;
}

export default function EventsReport({
  events,
  eventFees,
  eventPayments,
  preparedBy,
}: {
  events: MadrasahEvent[];
  eventFees: EventStudentFee[];
  eventPayments: EventPayment[];
  preparedBy: string;
}) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    events.length > 0 ? events[0].id : null
  );
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "partial" | "unpaid">("all");

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  const currentEventFees = useMemo(
    () => eventFees.filter((f) => f.event_id === selectedEventId),
    [eventFees, selectedEventId]
  );

  const currentEventPayments = useMemo(
    () => eventPayments.filter((p) => p.event_id === selectedEventId),
    [eventPayments, selectedEventId]
  );

  const classes = useMemo(
    () => Array.from(new Set(currentEventFees.map((f) => f.students?.class_name).filter(Boolean))),
    [currentEventFees]
  );

  // প্রতিটি শিক্ষার্থীর হিসাব
  const rows = useMemo(() => {
    return currentEventFees.map((f) => {
      const paid = currentEventPayments
        .filter((p) => p.student_id === f.student_id)
        .reduce((s, p) => s + Number(p.amount), 0);
      const payable = Number(f.payable_amount) - Number(f.discount || 0);
      const due = payable - paid;

      let status: "paid" | "partial" | "unpaid" = "unpaid";
      if (paid >= payable && payable > 0) status = "paid";
      else if (paid > 0) status = "partial";

      return {
        fee: f,
        student: f.students,
        payable,
        discount: Number(f.discount || 0),
        paid,
        due,
        status,
      };
    });
  }, [currentEventFees, currentEventPayments]);

  // ফিল্টার
  const filtered = rows.filter((r) => {
    if (classFilter && r.student?.class_name !== classFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  // ক্লাসভিত্তিক সারসংক্ষেপ
  const classSummary = useMemo(() => {
    const summary: Record<
      string,
      {
        totalStudents: number;
        payable: number;
        discount: number;
        paid: number;
        due: number;
        paidCount: number;
        partialCount: number;
        unpaidCount: number;
      }
    > = {};

    rows.forEach((r) => {
      const cls = r.student?.class_name || "অন্যান্য";
      if (!summary[cls]) {
        summary[cls] = {
          totalStudents: 0,
          payable: 0,
          discount: 0,
          paid: 0,
          due: 0,
          paidCount: 0,
          partialCount: 0,
          unpaidCount: 0,
        };
      }
      summary[cls].totalStudents += 1;
      summary[cls].payable += r.payable;
      summary[cls].discount += r.discount;
      summary[cls].paid += r.paid;
      summary[cls].due += r.due;
      if (r.status === "paid") summary[cls].paidCount += 1;
      else if (r.status === "partial") summary[cls].partialCount += 1;
      else summary[cls].unpaidCount += 1;
    });

    return Object.entries(summary).sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.payable += r.payable;
        acc.discount += r.discount;
        acc.paid += r.paid;
        acc.due += r.due;
        if (r.status === "paid") acc.paidCount += 1;
        else if (r.status === "partial") acc.partialCount += 1;
        else acc.unpaidCount += 1;
        return acc;
      },
      { payable: 0, discount: 0, paid: 0, due: 0, paidCount: 0, partialCount: 0, unpaidCount: 0 }
    );
  }, [filtered]);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* ============ স্ক্রিনে ফিল্টার ============ */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              ইভেন্ট
            </label>
            <select
              value={selectedEventId || ""}
              onChange={(e) => setSelectedEventId(Number(e.target.value) || null)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">-- ইভেন্ট নির্বাচন --</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                  {ev.is_closed ? " (ক্লোজড)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              শ্রেণি
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">সব শ্রেণি</option>
              {classes.map((c) => (
                <option key={c} value={c!}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              স্ট্যাটাস
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">সব</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex-1 flex flex-wrap gap-2">
            <Badge label="মোট" value={toBangla(filtered.length) + " জন"} color="#2563eb" />
            <Badge label="প্রাপ্য" value={"৳" + toBangla(totals.payable)} color="#1e40af" />
            <Badge label="ছাড়" value={"৳" + toBangla(totals.discount)} color="#b45309" />
            <Badge label="জমা" value={"৳" + toBangla(totals.paid)} color="#15803d" />
            <Badge label="বাকি" value={"৳" + toBangla(totals.due)} color="#b91c1c" />
          </div>
          <button
            onClick={handlePrint}
            disabled={!selectedEvent}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md transition flex items-center gap-2 disabled:opacity-50"
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

      {/* ============ প্রিন্ট এরিয়া ============ */}
      {!selectedEvent ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-500 border border-slate-200 dark:border-slate-800">
          কোনো ইভেন্ট নির্বাচন করা হয়নি
        </div>
      ) : (
        <div className="print-area">
          {/* প্রিন্ট হেডার */}
          <div className="bg-white rounded-2xl px-4 sm:px-6 py-4 mb-4 border-b-2 border-purple-600">
            <div className="text-center mb-3">
              <h1 className="text-lg sm:text-xl font-bold text-purple-700 mb-1">
                দারুল হিকমাহ মডেল মাদ্রাসা
              </h1>
              <p className="text-xs text-slate-500">
                ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
              </p>
            </div>
            <div className="flex justify-between flex-wrap gap-2 text-xs sm:text-sm mb-1">
              <div><strong>বিষয়:</strong> {selectedEvent.name} — ইভেন্ট ফি রিপোর্ট</div>
              <div><strong>তারিখ:</strong> {todayBangla()}</div>
            </div>
            <div className="flex justify-between flex-wrap gap-2 text-xs sm:text-sm">
              <div>
                <strong>ইভেন্ট তারিখ:</strong> {formatDate(selectedEvent.start_date)}
                {selectedEvent.end_date !== selectedEvent.start_date &&
                  ` — ${formatDate(selectedEvent.end_date)}`}
              </div>
              <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
            </div>
          </div>

          {/* ============ ১. ক্লাসভিত্তিক সারসংক্ষেপ ============ */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              📊 ক্লাসভিত্তিক সারসংক্ষেপ
            </h3>

            {/* মোবাইল কার্ড */}
            <div className="md:hidden space-y-2">
              {classSummary.map(([cls, data]) => (
                <div
                  key={cls}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{cls}</span>
                    <span className="text-[10px] text-white opacity-90">
                      {toBangla(data.totalStudents)} জন
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-3 text-xs">
                    <div>
                      <span className="text-slate-500">প্রাপ্য:</span>{" "}
                      <strong className="text-blue-600">৳{toBangla(data.payable)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">ছাড়:</span>{" "}
                      <strong className="text-amber-600">৳{toBangla(data.discount)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">জমা:</span>{" "}
                      <strong className="text-emerald-600">৳{toBangla(data.paid)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">বাকি:</span>{" "}
                      <strong className="text-red-600">৳{toBangla(data.due)}</strong>
                    </div>
                    <div className="col-span-2 flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        Paid: {toBangla(data.paidCount)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        Partial: {toBangla(data.partialCount)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                        Unpaid: {toBangla(data.unpaidCount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ডেস্কটপ টেবিল */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-purple-600 text-white">
                    <th className="border border-slate-300 px-3 py-2 text-left">শ্রেণি</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">শিক্ষার্থী</th>
                    <th className="border border-slate-300 px-3 py-2 text-right">প্রাপ্য</th>
                    <th className="border border-slate-300 px-3 py-2 text-right">ছাড়</th>
                    <th className="border border-slate-300 px-3 py-2 text-right">জমা</th>
                    <th className="border border-slate-300 px-3 py-2 text-right">বাকি</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Paid</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Partial</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Unpaid</th>
                  </tr>
                </thead>
                <tbody>
                  {classSummary.map(([cls, data]) => (
                    <tr key={cls} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="border border-slate-300 px-3 py-2 font-medium">{cls}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center">{toBangla(data.totalStudents)}</td>
                      <td className="border border-slate-300 px-3 py-2 text-right">৳{toBangla(data.payable)}</td>
                      <td className="border border-slate-300 px-3 py-2 text-right text-amber-600">৳{toBangla(data.discount)}</td>
                      <td className="border border-slate-300 px-3 py-2 text-right text-emerald-700 font-semibold">৳{toBangla(data.paid)}</td>
                      <td className="border border-slate-300 px-3 py-2 text-right text-red-700 font-semibold">৳{toBangla(data.due)}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center">{toBangla(data.paidCount)}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center">{toBangla(data.partialCount)}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center">{toBangla(data.unpaidCount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                    <td colSpan={2} className="border border-slate-300 px-3 py-2 text-right">সর্বমোট</td>
                    <td className="border border-slate-300 px-3 py-2 text-right">৳{toBangla(totals.payable)}</td>
                    <td className="border border-slate-300 px-3 py-2 text-right text-amber-600">৳{toBangla(totals.discount)}</td>
                    <td className="border border-slate-300 px-3 py-2 text-right text-emerald-700">৳{toBangla(totals.paid)}</td>
                    <td className="border border-slate-300 px-3 py-2 text-right text-red-700">৳{toBangla(totals.due)}</td>
                    <td className="border border-slate-300 px-3 py-2 text-center">{toBangla(totals.paidCount)}</td>
                    <td className="border border-slate-300 px-3 py-2 text-center">{toBangla(totals.partialCount)}</td>
                    <td className="border border-slate-300 px-3 py-2 text-center">{toBangla(totals.unpaidCount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ============ ২. শিক্ষার্থীভিত্তিক বিস্তারিত ============ */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              📋 শিক্ষার্থীভিত্তিক বিস্তারিত ({toBangla(filtered.length)} জন)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-purple-600 text-white">
                    <th className="border border-slate-300 px-2 py-2 text-left">নং</th>
                    <th className="border border-slate-300 px-2 py-2 text-left">নাম</th>
                    <th className="border border-slate-300 px-2 py-2 text-left">শ্রেণি</th>
                    <th className="border border-slate-300 px-2 py-2 text-left">রোল</th>
                    <th className="border border-slate-300 px-2 py-2 text-right">প্রাপ্য</th>
                    <th className="border border-slate-300 px-2 py-2 text-right">ছাড়</th>
                    <th className="border border-slate-300 px-2 py-2 text-right">জমা</th>
                    <th className="border border-slate-300 px-2 py-2 text-right">বাকি</th>
                    <th className="border border-slate-300 px-2 py-2 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const badge =
                      r.status === "paid"
                        ? { bg: "#dcfce7", text: "#15803d", label: "Paid" }
                        : r.status === "partial"
                        ? { bg: "#fef3c7", text: "#b45309", label: "Partial" }
                        : { bg: "#fee2e2", text: "#b91c1c", label: "Unpaid" };

                    return (
                      <tr key={r.fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="border border-slate-300 px-2 py-1.5 text-center">{toBangla(i + 1)}</td>
                        <td className="border border-slate-300 px-2 py-1.5 font-medium">{r.student?.name}</td>
                        <td className="border border-slate-300 px-2 py-1.5">{r.student?.class_name}</td>
                        <td className="border border-slate-300 px-2 py-1.5">{r.student?.roll || "-"}</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-right">৳{toBangla(r.fee.payable_amount)}</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-right text-amber-600">
                          ৳{toBangla(r.discount)}
                          {r.fee.discount_reason && (
                            <div className="text-[9px] text-slate-400">{r.fee.discount_reason}</div>
                          )}
                        </td>
                        <td className="border border-slate-300 px-2 py-1.5 text-right font-semibold text-emerald-700">
                          ৳{toBangla(r.paid)}
                        </td>
                        <td className={`border border-slate-300 px-2 py-1.5 text-right font-semibold ${r.due > 0 ? "text-red-700" : "text-slate-400"}`}>
                          ৳{toBangla(r.due)}
                        </td>
                        <td className="border border-slate-300 px-2 py-1.5 text-center">
                          <span
                            className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ background: badge.bg, color: badge.text }}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                    <td colSpan={4} className="border border-slate-300 px-2 py-2 text-right">
                      সর্বমোট ({toBangla(filtered.length)} জন):
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-right">৳{toBangla(totals.payable)}</td>
                    <td className="border border-slate-300 px-2 py-2 text-right text-amber-600">৳{toBangla(totals.discount)}</td>
                    <td className="border border-slate-300 px-2 py-2 text-right text-emerald-700">৳{toBangla(totals.paid)}</td>
                    <td className="border border-slate-300 px-2 py-2 text-right text-red-700">৳{toBangla(totals.due)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* স্বাক্ষর */}
          <div className="hidden print:flex justify-between mt-14 pt-2">
            <div className="text-center" style={{ minWidth: "150px" }}>
              <div style={{ borderTop: "1px solid #475569", paddingTop: "4px", fontSize: "11px" }}>
                প্রস্তুতকারীর স্বাক্ষর
              </div>
            </div>
            <div className="text-center" style={{ minWidth: "150px" }}>
              <div style={{ borderTop: "1px solid #475569", paddingTop: "4px", fontSize: "11px" }}>
                অনুমোদনকারীর স্বাক্ষর
              </div>
            </div>
          </div>

          <div className="hidden print:block text-center text-[10px] text-slate-500 mt-6">
            এই রিপোর্টটি কম্পিউটার দ্বারা স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।
          </div>
        </div>
      )}
    </>
  );
}

function Badge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="px-3 py-1.5 rounded-xl flex items-center gap-2"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <span className="text-[10px] text-slate-500 dark:text-slate-400">{label}:</span>
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
