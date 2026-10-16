"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: number;
  name: string;
  class_name: string;
  section: string | null;
  roll: string | null;
  photo_url: string | null;
};

type MadrasahEvent = {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  default_fee: number;
  fee_mode: string;
  class_fees: Record<string, number>;
  applies_to: string;
  applies_to_value: string | null;
  is_closed: boolean;
  created_at: string;
};

type EventStudentFee = {
  id: number;
  event_id: number;
  student_id: number;
  payable_amount: number;
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
  note: string | null;
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const PAYMENT_METHODS = [
  { value: "cash", label: "নগদ" },
  { value: "bkash", label: "বিকাশ" },
  { value: "nagad", label: "নগদ (Nagad)" },
  { value: "bank", label: "ব্যাংক" },
  { value: "other", label: "অন্যান্য" },
];

function toBangla(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())}`;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function paymentMethodLabel(m: string): string {
  return PAYMENT_METHODS.find((p) => p.value === m)?.label || m;
}

export default function EventsClient({
  initialEvents,
  initialEventFees,
  initialEventPayments,
  students,
  classes,
  role,
  userName,
}: {
  initialEvents: MadrasahEvent[];
  initialEventFees: EventStudentFee[];
  initialEventPayments: EventPayment[];
  students: Student[];
  classes: string[];
  role: string;
  userName: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [events, setEvents] = useState(initialEvents);
  const [eventFees, setEventFees] = useState(initialEventFees);
  const [payments, setPayments] = useState(initialEventPayments);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    initialEvents.length > 0 ? initialEvents[0].id : null
  );
  const [tab, setTab] = useState<"list" | "create" | "manage">("list");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const canManage = role === "admin" || role === "accountant";

  // ইভেন্ট তৈরি ফর্ম
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: todayISO(),
    end_date: todayISO(),
    default_fee: "",
    fee_mode: "same" as "same" | "per_class",
    class_fees: {} as Record<string, string>,
    applies_to: "all" as "all" | "class" | "selected",
    applies_to_value: "",
    selected_students: [] as number[],
  });

  // ফি জমা ফর্ম
  const [paymentForm, setPaymentForm] = useState({
    student_id: "",
    amount: "",
    payment_date: todayISO(),
    payment_method: "cash",
    receipt_no: "",
    note: "",
  });

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  const currentEventFees = useMemo(
    () => eventFees.filter((f) => f.event_id === selectedEventId),
    [eventFees, selectedEventId]
  );

  const currentEventPayments = useMemo(
    () => payments.filter((p) => p.event_id === selectedEventId),
    [payments, selectedEventId]
  );

  // ইভেন্টের হিসাব
  const eventStats = useMemo(() => {
    const totalPayable = currentEventFees.reduce(
      (s, f) => s + Number(f.payable_amount),
      0
    );
    const totalPaid = currentEventPayments.reduce(
      (s, p) => s + Number(p.amount),
      0
    );
    const totalDue = totalPayable - totalPaid;
    const paidCount = currentEventFees.filter((f) => {
      const paid = currentEventPayments
        .filter((p) => p.student_id === f.student_id)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      return paid >= Number(f.payable_amount);
    }).length;
    const partialCount = currentEventFees.filter((f) => {
      const paid = currentEventPayments
        .filter((p) => p.student_id === f.student_id)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      return paid > 0 && paid < Number(f.payable_amount);
    }).length;
    const unpaidCount = currentEventFees.length - paidCount - partialCount;

    return { totalPayable, totalPaid, totalDue, paidCount, partialCount, unpaidCount };
  }, [currentEventFees, currentEventPayments]);

  // ইভেন্ট তৈরি
  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("ইভেন্টের নাম দিন");
      setSaving(false);
      return;
    }

    // ফি মোড চেক
    if (form.fee_mode === "same" && !form.default_fee) {
      setError("ডিফল্ট ফি দিন");
      setSaving(false);
      return;
    }

    if (form.fee_mode === "per_class") {
      const missing = classes.filter((c) => !form.class_fees[c]);
      if (missing.length > 0) {
        setError(`এই শ্রেণিগুলোর ফি দিন: ${missing.join(", ")}`);
        setSaving(false);
        return;
      }
    }

    // class_fees তৈরি
    const classFeesObj: Record<string, number> = {};
    if (form.fee_mode === "per_class") {
      classes.forEach((c) => {
        classFeesObj[c] = Number(form.class_fees[c]) || 0;
      });
    }

    const { data: newEvent, error: eventError } = await supabase
      .from("madrasah_events")
      .insert({
        name: form.name,
        description: form.description || null,
        start_date: form.start_date,
        end_date: form.end_date,
        default_fee: Number(form.default_fee) || 0,
        fee_mode: form.fee_mode,
        class_fees: classFeesObj,
        applies_to: form.applies_to,
        applies_to_value:
          form.applies_to === "class" ? form.applies_to_value : null,
      })
      .select()
      .single();

    if (eventError || !newEvent) {
      setError("ইভেন্ট তৈরি করতে সমস্যা: " + (eventError?.message || ""));
      setSaving(false);
      return;
    }

    // শিক্ষার্থী নির্বাচন
    let targetStudents: Student[] = [];
    if (form.applies_to === "all") {
      targetStudents = students;
    } else if (form.applies_to === "class") {
      targetStudents = students.filter(
        (s) => s.class_name === form.applies_to_value
      );
    } else if (form.applies_to === "selected") {
      targetStudents = students.filter((s) =>
        form.selected_students.includes(s.id)
      );
    }

    if (targetStudents.length === 0) {
      setError("কোনো শিক্ষার্থী নির্বাচন করা হয়নি");
      setSaving(false);
      return;
    }

    // ফি অ্যাসাইন
    const feeRows = targetStudents.map((s) => {
      let fee = 0;
      if (form.fee_mode === "same") {
        fee = Number(form.default_fee) || 0;
      } else {
        fee = classFeesObj[s.class_name] || 0;
      }
      return {
        event_id: newEvent.id,
        student_id: s.id,
        payable_amount: fee,
      };
    });

    const { error: feeError } = await supabase
      .from("event_student_fees")
      .insert(feeRows);

    if (feeError) {
      setError("ফি অ্যাসাইন করতে সমস্যা: " + feeError.message);
      setSaving(false);
      return;
    }

    setMessage("ইভেন্ট সফলভাবে তৈরি হয়েছে");
    setSaving(false);
    setForm({
      name: "",
      description: "",
      start_date: todayISO(),
      end_date: todayISO(),
      default_fee: "",
      fee_mode: "same",
      class_fees: {},
      applies_to: "all",
      applies_to_value: "",
      selected_students: [],
    });
    setTab("list");
    setSelectedEventId(newEvent.id);
    router.refresh();
    window.location.reload();
  }

  // ফি জমা
  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEventId) return;
    setSaving(true);
    setError("");
    setMessage("");

    const studentId = Number(paymentForm.student_id);
    const amount = Number(paymentForm.amount);

    if (!studentId || !amount || amount <= 0) {
      setError("শিক্ষার্থী ও পরিমাণ দিন");
      setSaving(false);
      return;
    }

    const receiptNo =
      paymentForm.receipt_no ||
      `EVT-${selectedEventId}-${Date.now().toString().slice(-6)}`;

    const { error: payError } = await supabase.from("event_payments").insert({
      event_id: selectedEventId,
      student_id: studentId,
      amount,
      payment_date: paymentForm.payment_date,
      payment_method: paymentForm.payment_method,
      receipt_no: receiptNo,
      note: paymentForm.note || null,
    });

    if (payError) {
      setError("পেমেন্ট সংরক্ষণে সমস্যা: " + payError.message);
      setSaving(false);
      return;
    }

    setMessage(`ফি জমা সফল। রসিদ: ${receiptNo}`);
    setSaving(false);
    setPaymentForm({
      student_id: "",
      amount: "",
      payment_date: todayISO(),
      payment_method: "cash",
      receipt_no: "",
      note: "",
    });
    router.refresh();
    window.location.reload();
  }

  // ইভেন্ট ক্লোজ/রিওপেন
  async function toggleEventClose() {
    if (!selectedEvent) return;
    const action = selectedEvent.is_closed ? "রিওপেন" : "ক্লোজ";
    if (!confirm(`ইভেন্ট ${action} করতে চান?`)) return;

    const { error: err } = await supabase
      .from("madrasah_events")
      .update({ is_closed: !selectedEvent.is_closed })
      .eq("id", selectedEvent.id);

    if (err) {
      setError("সমস্যা: " + err.message);
      return;
    }

    setEvents((prev) =>
      prev.map((e) =>
        e.id === selectedEvent.id ? { ...e, is_closed: !e.is_closed } : e
      )
    );
    router.refresh();
  }

  // ইভেন্ট ডিলিট
  async function deleteEvent() {
    if (!selectedEvent) return;
    if (!confirm(`"${selectedEvent.name}" ইভেন্টটি ডিলিট করতে চান?`)) return;

    const { error: err } = await supabase
      .from("madrasah_events")
      .delete()
      .eq("id", selectedEvent.id);

    if (err) {
      setError("সমস্যা: " + err.message);
      return;
    }

    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    setSelectedEventId(events.find((e) => e.id !== selectedEvent.id)?.id || null);
    setTab("list");
    router.refresh();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-5 pb-6">
      {/* শিরোনাম */}
      <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
            ইভেন্ট ফি
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            মাদ্রাসার ইভেন্ট, ফি বরাদ্দ ও আদায়
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setTab(tab === "create" ? "list" : "create")}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold shadow-md shadow-purple-500/25 transition flex items-center gap-2"
          >
            {tab === "create" ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                তালিকায় ফিরে যান
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                নতুন ইভেন্ট
              </>
            )}
          </button>
        )}
      </div>

      {/* মেসেজ */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {message}
        </div>
      )}

      {/* ============ ট্যাব ১: ইভেন্ট তৈরি ============ */}
      {tab === "create" && canManage && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            নতুন ইভেন্ট তৈরি করুন
          </h2>

          <form onSubmit={handleCreateEvent} className="space-y-4">
            {/* নাম ও বিবরণ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  ইভেন্টের নাম *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="যেমন: বার্ষিক ক্রীড়া প্রতিযোগিতা"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  বিবরণ
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="সংক্ষিপ্ত বিবরণ"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* তারিখ */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  শুরুর তারিখ
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  শেষের তারিখ
                </label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* ফি মোড */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                ফি নির্ধারণের পদ্ধতি *
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, fee_mode: "same" })}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                    form.fee_mode === "same"
                      ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  🔄 সব শ্রেণির জন্য একই
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, fee_mode: "per_class" })}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                    form.fee_mode === "per_class"
                      ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  📋 প্রতিটি শ্রেণির আলাদা
                </button>
              </div>
            </div>

            {/* সব শ্রেণির জন্য একই ফি */}
            {form.fee_mode === "same" && (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  ফি (৳) *
                </label>
                <input
                  type="number"
                  value={form.default_fee}
                  onChange={(e) => setForm({ ...form, default_fee: e.target.value })}
                  placeholder="যেমন: ১০০"
                  required
                  min={0}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  সব নির্বাচিত শিক্ষার্থীর জন্য এই ফি প্রযোজ্য হবে
                </p>
              </div>
            )}

            {/* প্রতিটি শ্রেণির আলাদা ফি */}
            {form.fee_mode === "per_class" && (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  প্রতিটি শ্রেণির ফি (৳) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  {classes.map((c) => (
                    <div key={c}>
                      <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        {c}
                      </label>
                      <input
                        type="number"
                        value={form.class_fees[c] || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            class_fees: { ...form.class_fees, [c]: e.target.value },
                          })
                        }
                        placeholder="০"
                        min={0}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  প্রতিটি শ্রেণির জন্য আলাদা ফি সেট করুন। একই রাখতে চাইলে একই সংখ্যা লিখুন।
                </p>
              </div>
            )}

            {/* শিক্ষার্থী নির্বাচন */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                কাদের জন্য প্রযোজ্য? *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "all", l: "সব শিক্ষার্থী" },
                  { v: "class", l: "নির্দিষ্ট শ্রেণি" },
                  { v: "selected", l: "নির্দিষ্ট শিক্ষার্থী" },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        applies_to: opt.v as any,
                        applies_to_value: "",
                        selected_students: [],
                      })
                    }
                    className={`py-2.5 rounded-xl text-xs font-semibold transition border-2 ${
                      form.applies_to === opt.v
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {/* নির্দিষ্ট শ্রেণি */}
            {form.applies_to === "class" && (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  শ্রেণি নির্বাচন করুন
                </label>
                <select
                  value={form.applies_to_value}
                  onChange={(e) =>
                    setForm({ ...form, applies_to_value: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">-- শ্রেণি --</option>
                  {classes.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* নির্দিষ্ট শিক্ষার্থী */}
            {form.applies_to === "selected" && (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  শিক্ষার্থী নির্বাচন করুন ({toBangla(form.selected_students.length)} জন)
                </label>
                <div className="max-h-[300px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50 dark:bg-slate-800">
                  {students.map((s) => {
                    const checked = form.selected_students.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${
                          checked ? "bg-brand-50 dark:bg-brand-900/20" : "hover:bg-white dark:hover:bg-slate-900"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                selected_students: [...form.selected_students, s.id],
                              });
                            } else {
                              setForm({
                                ...form,
                                selected_students: form.selected_students.filter(
                                  (id) => id !== s.id
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 accent-brand-600"
                        />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {s.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({s.class_name}{s.roll ? ` - ${s.roll}` : ""})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  ইভেন্ট তৈরি করুন
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ============ ট্যাব ২: ইভেন্ট তালিকা ============ */}
      {tab === "list" && (
        <>
          {events.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-500 border border-slate-200 dark:border-slate-800">
              <svg className="mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="text-sm mb-1">কোনো ইভেন্ট নেই</p>
              {canManage && (
                <p className="text-xs text-slate-400">
                  উপরের "নতুন ইভেন্ট" বাটনে ক্লিক করুন
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {events.map((ev) => {
                const fees = eventFees.filter((f) => f.event_id === ev.id);
                const evPayments = payments.filter((p) => p.event_id === ev.id);
                const totalPayable = fees.reduce(
                  (s, f) => s + Number(f.payable_amount),
                  0
                );
                const totalPaid = evPayments.reduce(
                  (s, p) => s + Number(p.amount),
                  0
                );

                return (
                  <button
                    key={ev.id}
                    onClick={() => {
                      setSelectedEventId(ev.id);
                      setTab("manage");
                    }}
                    className="text-left bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-400 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {ev.name}
                      </h3>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ev.is_closed
                            ? "bg-slate-100 text-slate-600"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {ev.is_closed ? "ক্লোজড" : "সক্রিয়"}
                      </span>
                    </div>
                    {ev.description && (
                      <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">
                        {ev.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-3">
                      <span>📅 {formatDate(ev.start_date)}</span>
                      {ev.end_date !== ev.start_date && (
                        <span>— {formatDate(ev.end_date)}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="text-[9px] text-slate-400">শিক্ষার্থী</div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {toBangla(fees.length)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">প্রাপ্য</div>
                        <div className="text-xs font-bold text-blue-600">
                          ৳{toBangla(totalPayable)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">আদায়</div>
                        <div className="text-xs font-bold text-emerald-600">
                          ৳{toBangla(totalPaid)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ============ ট্যাব ৩: ইভেন্ট ম্যানেজমেন্ট ============ */}
      {tab === "manage" && selectedEvent && (
        <div className="space-y-4">
          {/* ইভেন্ট হেডার */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold mb-1 truncate">
                  {selectedEvent.name}
                </h2>
                {selectedEvent.description && (
                  <p className="text-xs opacity-90">{selectedEvent.description}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] opacity-80 mt-2">
                  <span>📅 {formatDate(selectedEvent.start_date)}</span>
                  {selectedEvent.end_date !== selectedEvent.start_date && (
                    <span>— {formatDate(selectedEvent.end_date)}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setTab("list")}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
              <div>
                <div className="text-[10px] opacity-75 mb-0.5">মোট প্রাপ্য</div>
                <div className="text-base font-bold">৳{toBangla(eventStats.totalPayable)}</div>
              </div>
              <div>
                <div className="text-[10px] opacity-75 mb-0.5">মোট আদায়</div>
                <div className="text-base font-bold">৳{toBangla(eventStats.totalPaid)}</div>
              </div>
              <div>
                <div className="text-[10px] opacity-75 mb-0.5">মোট বাকি</div>
                <div className="text-base font-bold">৳{toBangla(eventStats.totalDue)}</div>
              </div>
            </div>
          </div>

          {/* সারাংশ */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 border border-emerald-100 dark:border-emerald-900/40 text-center">
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mb-1">Paid</div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {toBangla(eventStats.paidCount)}
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 border border-amber-100 dark:border-amber-900/40 text-center">
              <div className="text-[10px] text-amber-700 dark:text-amber-400 mb-1">Partial</div>
              <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
                {toBangla(eventStats.partialCount)}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-3 border border-red-100 dark:border-red-900/40 text-center">
              <div className="text-[10px] text-red-700 dark:text-red-400 mb-1">Unpaid</div>
              <div className="text-lg font-bold text-red-700 dark:text-red-400">
                {toBangla(eventStats.unpaidCount)}
              </div>
            </div>
          </div>

          {/* অ্যাকশন বাটন */}
          {canManage && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-md transition flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print / PDF
              </button>
              <button
                onClick={toggleEventClose}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition flex items-center gap-2 ${
                  selectedEvent.is_closed
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {selectedEvent.is_closed ? "🔄 রিওপেন" : "🔒 ক্লোজ"}
              </button>
              <button
                onClick={deleteEvent}
                className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold transition flex items-center gap-2"
              >
                🗑️ ডিলিট
              </button>
            </div>
          )}

          {/* ফি জমা ফর্ম */}
          {canManage && !selectedEvent.is_closed && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                ফি জমা নিন
              </h3>
              <form onSubmit={handlePayment} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    শিক্ষার্থী *
                  </label>
                  <select
                    value={paymentForm.student_id}
                    onChange={(e) => {
                      const sid = e.target.value;
                      setPaymentForm({ ...paymentForm, student_id: sid });
                      // প্রাপ্য ফি অটো ফিল
                      const fee = currentEventFees.find(
                        (f) => f.student_id === Number(sid)
                      );
                      if (fee) {
                        setPaymentForm((prev) => ({
                          ...prev,
                          student_id: sid,
                          amount: String(fee.payable_amount),
                        }));
                      }
                    }}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">-- শিক্ষার্থী নির্বাচন --</option>
                    {currentEventFees.map((f) => (
                      <option key={f.id} value={f.student_id}>
                        {f.students?.name} ({f.students?.class_name}
                        {f.students?.roll ? ` - ${f.students.roll}` : ""}) — ৳
                        {f.payable_amount}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    পরিমাণ (৳) *
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, amount: e.target.value })
                    }
                    required
                    min={1}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    তারিখ
                  </label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, payment_date: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    পেমেন্ট পদ্ধতি
                  </label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, payment_method: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    রসিদ নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={paymentForm.receipt_no}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, receipt_no: e.target.value })
                    }
                    placeholder="স্বয়ংক্রিয়"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    নোট
                  </label>
                  <input
                    type="text"
                    value={paymentForm.note}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, note: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="sm:col-span-2 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? "সংরক্ষণ..." : "ফি জমা নিন"}
                </button>
              </form>
            </div>
          )}

          {/* শিক্ষার্থীদের ফি তালিকা */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                শিক্ষার্থীদের ফি তালিকা ({toBangla(currentEventFees.length)} জন)
              </h3>
            </div>

            {/* মোবাইল কার্ড */}
            <div className="md:hidden p-3 space-y-2">
              {currentEventFees.map((f) => {
                const paid = currentEventPayments
                  .filter((p) => p.student_id === f.student_id)
                  .reduce((s, p) => s + Number(p.amount), 0);
                const due = Number(f.payable_amount) - paid;
                let status: "paid" | "partial" | "unpaid" = "unpaid";
                if (paid >= Number(f.payable_amount) && Number(f.payable_amount) > 0)
                  status = "paid";
                else if (paid > 0) status = "partial";

                const sc =
                  status === "paid"
                    ? { bg: "#f0fdf4", text: "#15803d", badge: "#dcfce7", label: "Paid" }
                    : status === "partial"
                    ? { bg: "#fffbeb", text: "#b45309", badge: "#fef3c7", label: "Partial" }
                    : { bg: "#fef2f2", text: "#b91c1c", badge: "#fee2e2", label: "Unpaid" };

                return (
                  <div
                    key={f.id}
                    className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                    style={{ borderLeftWidth: "4px", borderLeftColor: sc.text }}
                  >
                    <div className="p-3 flex items-start gap-3" style={{ background: sc.bg }}>
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 border border-white">
                        {f.students?.photo_url ? (
                          <img
                            src={f.students.photo_url}
                            alt={f.students.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-slate-400 font-bold text-sm">
                            {f.students?.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {f.students?.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {f.students?.class_name}
                          {f.students?.roll && ` • রোল ${f.students.roll}`}
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                        style={{ background: sc.badge, color: sc.text }}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <div className="p-3 grid grid-cols-3 gap-2 bg-white dark:bg-slate-900">
                      <div className="text-center">
                        <div className="text-[9px] text-slate-400">প্রাপ্য</div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          ৳{toBangla(f.payable_amount)}
                        </div>
                      </div>
                      <div className="text-center border-x border-slate-100 dark:border-slate-800">
                        <div className="text-[9px] text-slate-400">জমা</div>
                        <div className="text-xs font-bold text-emerald-600">
                          ৳{toBangla(paid)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] text-slate-400">বাকি</div>
                        <div className={`text-xs font-bold ${due > 0 ? "text-red-600" : "text-slate-400"}`}>
                          ৳{toBangla(due)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ডেস্কটপ টেবিল */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">নাম</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">শ্রেণি</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">রোল</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">প্রাপ্য</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">জমা</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">বাকি</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEventFees.map((f) => {
                    const paid = currentEventPayments
                      .filter((p) => p.student_id === f.student_id)
                      .reduce((s, p) => s + Number(p.amount), 0);
                    const due = Number(f.payable_amount) - paid;
                    let status: "paid" | "partial" | "unpaid" = "unpaid";
                    if (paid >= Number(f.payable_amount) && Number(f.payable_amount) > 0)
                      status = "paid";
                    else if (paid > 0) status = "partial";

                    const badge =
                      status === "paid"
                        ? { bg: "#dcfce7", text: "#15803d", label: "Paid" }
                        : status === "partial"
                        ? { bg: "#fef3c7", text: "#b45309", label: "Partial" }
                        : { bg: "#fee2e2", text: "#b91c1c", label: "Unpaid" };

                    return (
                      <tr
                        key={f.id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-white">
                          {f.students?.name}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                          {f.students?.class_name}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                          {f.students?.roll || "-"}
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300">
                          ৳{toBangla(f.payable_amount)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-emerald-700">
                          ৳{toBangla(paid)}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-right font-medium ${
                            due > 0 ? "text-red-700" : "text-slate-400"
                          }`}
                        >
                          ৳{toBangla(due)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
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
                  <tr className="bg-slate-50 dark:bg-slate-800 border-t-2 border-purple-600">
                    <td colSpan={3} className="px-3 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                      সর্বমোট ({toBangla(currentEventFees.length)} জন):
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-white">
                      ৳{toBangla(eventStats.totalPayable)}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-emerald-700">
                      ৳{toBangla(eventStats.totalPaid)}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-red-700">
                      ৳{toBangla(eventStats.totalDue)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============ ট্যাব খালি অবস্থায় ============ */}
      {tab === "manage" && !selectedEvent && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-500 border border-slate-200 dark:border-slate-800">
          <p className="text-sm">কোনো ইভেন্ট নির্বাচন করা হয়নি</p>
        </div>
      )}
    </div>
  );
}
