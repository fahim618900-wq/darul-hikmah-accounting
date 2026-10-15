"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Student = { id: number; name: string; class_name: string; roll: string | null; student_id: string | null };
type Event = { id: number; name: string; description: string | null; default_fee: number; applies_to: string; class_names: string[]; starts_on: string | null; ends_on: string | null; status: string };
type Assignment = { id: number; event_id: number; student_id: number; payable_amount: number; students?: Student };
type Payment = { id: number; event_id: number; student_id: number; amount: number; payment_date: string; receipt_no: string; is_deleted: boolean; students?: Student };

const money = (n: number) => new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 2 }).format(n || 0);
const today = () => new Date().toLocaleDateString("en-CA");

export default function EventsClient({ students, initialEvents, initialAssignments, initialPayments, userName, canManage }: {
  students: Student[]; initialEvents: Event[]; initialAssignments: Assignment[]; initialPayments: Payment[]; userName: string; canManage: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [payments, setPayments] = useState(initialPayments);
  const [selectedEvent, setSelectedEvent] = useState<number | "">("");
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState("0");
  const [appliesTo, setAppliesTo] = useState("all");
  const [className, setClassName] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState("");
  const [studentId, setStudentId] = useState<number | "">("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const activeEvent = events.find(e => e.id === selectedEvent);
  const assigned = useMemo(() => assignments.filter(a => a.event_id === selectedEvent), [assignments, selectedEvent]);
  const eventPayments = useMemo(() => payments.filter(p => p.event_id === selectedEvent && !p.is_deleted), [payments, selectedEvent]);
  const rows = assigned.map(a => {
    const student = students.find(s => s.id === a.student_id) || a.students;
    const paid = eventPayments.filter(p => p.student_id === a.student_id).reduce((sum,p) => sum + Number(p.amount),0);
    const payable = Number(a.payable_amount || 0);
    return { ...a, student, paid, due: Math.max(0, payable-paid), status: paid >= payable ? "Paid" : paid > 0 ? "Partial" : "Unpaid" };
  });
  const classes = [...new Set(students.map(s => s.class_name))].sort();
  const totalPayable = rows.reduce((s,r) => s + Number(r.payable_amount),0);
  const totalPaid = rows.reduce((s,r) => s + r.paid,0);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault(); setError(""); setNotice("");
    if (!canManage) return;
    const amount = Number(fee);
    if (!name.trim() || !Number.isFinite(amount) || amount < 0) { setError("ইভেন্টের নাম ও সঠিক ফি দিন।"); return; }
    if (appliesTo === "class" && !className) { setError("একটি শ্রেণি নির্বাচন করুন।"); return; }
    setBusy(true);
    const { data: event, error: eventError } = await supabase.from("madrasah_events").insert({
      name: name.trim(), description: description.trim() || null, default_fee: amount,
      applies_to: appliesTo, class_names: appliesTo === "class" ? [className] : [],
      starts_on: startDate || null, ends_on: endDate || null, created_by: (await supabase.auth.getUser()).data.user?.id,
      status: "active",
    }).select("*").single();
    if (eventError || !event) { setError(eventError?.message || "ইভেন্ট তৈরি করা যায়নি।"); setBusy(false); return; }
    const eligible = students.filter(s => appliesTo === "all" || (appliesTo === "class" && s.class_name === className));
    if (eligible.length) {
      const { data: assignedRows, error: assignError } = await supabase.from("event_student_fees").insert(
        eligible.map(s => ({ event_id: event.id, student_id: s.id, payable_amount: amount }))
      ).select("id,event_id,student_id,payable_amount");
      if (assignError) { setError("ইভেন্ট তৈরি হয়েছে, কিন্তু শিক্ষার্থী বরাদ্দ সম্পূর্ণ হয়নি। অনুগ্রহ করে ইভেন্ট খুলে যাচাই করুন: " + assignError.message); }
      else setAssignments(prev => [...prev, ...(assignedRows || [])]);
    }
    setEvents(prev => [event, ...prev]); setSelectedEvent(event.id); setShowCreate(false);
    setName(""); setDescription(""); setFee("0"); setAppliesTo("all"); setClassName("");
    setNotice("ইভেন্ট তৈরি হয়েছে।"); setBusy(false); router.refresh();
  }

  async function collectPayment(e: React.FormEvent) {
    e.preventDefault(); setError(""); setNotice("");
    if (!canManage || !activeEvent || !studentId) { setError("ইভেন্ট ও শিক্ষার্থী নির্বাচন করুন।"); return; }
    if (activeEvent.status !== "active") { setError("বন্ধ বা খসড়া ইভেন্টে টাকা নেওয়া যাবে না।"); return; }
    const amount = Number(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) { setError("জমার পরিমাণ সঠিকভাবে দিন।"); return; }
    const row = rows.find(r => r.student_id === studentId);
    if (!row) { setError("এই শিক্ষার্থীর জন্য ইভেন্ট ফি নির্ধারিত নেই।"); return; }
    const receiptNo = "EV-" + Date.now().toString(36).toUpperCase();
    setBusy(true);
    const { data: payment, error: paymentError } = await supabase.from("event_payments").insert({
      event_id: activeEvent.id, student_id: studentId, amount, payment_method: payMethod,
      receipt_no: receiptNo, created_by: (await supabase.auth.getUser()).data.user?.id,
    }).select("*").single();
    if (paymentError || !payment) { setError(paymentError?.message || "পেমেন্ট সংরক্ষণ করা যায়নি।"); setBusy(false); return; }
    setPayments(prev => [payment, ...prev]); setPayAmount(""); setNotice("পেমেন্ট সংরক্ষিত। রসিদ নম্বর: " + receiptNo);
    setBusy(false); router.refresh();
  }

  async function toggleStatus(event: Event) {
    if (!canManage) return;
    const status = event.status === "active" ? "closed" : "active";
    if (status === "active" && !confirm("ইভেন্টটি আবার চালু করবেন?")) return;
    if (status === "closed" && !confirm("ইভেন্ট বন্ধ করবেন? পুরোনো হিসাব সংরক্ষিত থাকবে।")) return;
    setError(""); setNotice("");
    const { error: updateError } = await supabase.from("madrasah_events").update({ status, updated_at: new Date().toISOString() }).eq("id", event.id);
    if (updateError) { setError(updateError.message); return; }
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status } : e));
    setNotice(status === "closed" ? "ইভেন্ট বন্ধ হয়েছে; পুরোনো হিসাব রাখা হয়েছে।" : "ইভেন্ট চালু হয়েছে।");
  }

  return <main className="mx-auto max-w-7xl px-3 py-5 sm:px-5 space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">ইভেন্ট ফি</h1><p className="mt-1 text-sm text-slate-500">পরীক্ষা, অনুষ্ঠান, শিক্ষা সফর ও অন্যান্য নির্ধারিত ফি</p></div>
      {canManage && <button onClick={() => setShowCreate(v => !v)} className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white">{showCreate ? "বন্ধ করুন" : "+ নতুন ইভেন্ট"}</button>}
    </div>
    {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {showCreate && canManage && <form onSubmit={createEvent} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
      <label className="text-sm font-medium">ইভেন্টের নাম<input required value={name} onChange={e=>setName(e.target.value)} placeholder="যেমন: বার্ষিক পরীক্ষার ফি" className="mt-1 w-full rounded-xl border p-2.5 text-slate-900"/></label>
      <label className="text-sm font-medium">নির্ধারিত ফি (৳)<input required type="number" min="0" step="0.01" value={fee} onChange={e=>setFee(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 text-slate-900"/></label>
      <label className="text-sm font-medium">প্রযোজ্য শিক্ষার্থী<select value={appliesTo} onChange={e=>setAppliesTo(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 text-slate-900"><option value="all">সব শিক্ষার্থী</option><option value="class">নির্দিষ্ট শ্রেণি</option></select></label>
      {appliesTo === "class" && <label className="text-sm font-medium">শ্রেণি<select required value={className} onChange={e=>setClassName(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 text-slate-900"><option value="">শ্রেণি নির্বাচন</option>{classes.map(c=><option key={c}>{c}</option>)}</select></label>}
      <label className="text-sm font-medium">শুরুর তারিখ<input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 text-slate-900"/></label>
      <label className="text-sm font-medium">শেষ তারিখ (ঐচ্ছিক)<input type="date" min={startDate || undefined} value={endDate} onChange={e=>setEndDate(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 text-slate-900"/></label>
      <label className="text-sm font-medium sm:col-span-2">বিবরণ<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border p-2.5 text-slate-900"/></label>
      <div className="sm:col-span-2"><button disabled={busy} className="rounded-xl bg-teal-700 px-5 py-2.5 font-semibold text-white disabled:opacity-50">{busy ? "সংরক্ষণ হচ্ছে…" : "ইভেন্ট তৈরি ও ফি বরাদ্দ"}</button></div>
    </form>}
    <section className="grid gap-3 md:grid-cols-[minmax(240px,0.8fr)_minmax(0,2fr)]">
      <div className="space-y-2">
        <h2 className="font-semibold text-slate-800 dark:text-white">ইভেন্ট তালিকা</h2>
        {events.length === 0 && <div className="rounded-2xl border border-dashed p-6 text-sm text-slate-500">এখনও কোনো ইভেন্ট তৈরি হয়নি।</div>}
        {events.map(event=><button key={event.id} onClick={()=>{setSelectedEvent(event.id);setStudentId("");setPayAmount("");}} className={`w-full rounded-2xl border p-4 text-left ${selectedEvent===event.id ? "border-teal-600 bg-teal-50 dark:bg-teal-950/30" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}>
          <div className="flex items-start justify-between gap-2"><span className="font-semibold text-slate-900 dark:text-white">{event.name}</span><span className={`rounded-full px-2 py-0.5 text-xs ${event.status==="active"?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{event.status==="active"?"চালু":event.status==="closed"?"বন্ধ":"খসড়া"}</span></div>
          <div className="mt-2 text-sm text-slate-500">নির্ধারিত ফি: ৳{money(Number(event.default_fee))}</div>
          {canManage && <span onClick={e=>{e.stopPropagation();void toggleStatus(event)}} className="mt-3 inline-block text-xs font-semibold text-teal-700 underline">{event.status==="active"?"ইভেন্ট বন্ধ করুন":"আবার চালু করুন"}</span>}
        </button>)}
      </div>
      <div className="space-y-4">
        {!activeEvent ? <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">হিসাব দেখতে একটি ইভেন্ট নির্বাচন করুন।</div> : <>
          <div className="grid grid-cols-3 gap-2"><div className="rounded-2xl bg-white p-3 border dark:bg-slate-900 dark:border-slate-800"><div className="text-xs text-slate-500">মোট প্রদেয়</div><div className="mt-1 font-bold">৳{money(totalPayable)}</div></div><div className="rounded-2xl bg-white p-3 border dark:bg-slate-900 dark:border-slate-800"><div className="text-xs text-slate-500">মোট জমা</div><div className="mt-1 font-bold text-emerald-700">৳{money(totalPaid)}</div></div><div className="rounded-2xl bg-white p-3 border dark:bg-slate-900 dark:border-slate-800"><div className="text-xs text-slate-500">বকেয়া</div><div className="mt-1 font-bold text-red-700">৳{money(Math.max(0,totalPayable-totalPaid))}</div></div></div>
          {canManage && <form onSubmit={collectPayment} className="grid gap-2 rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-4">
            <div className="sm:col-span-4 font-semibold">ইভেন্ট ফি জমা নিন</div>
            <select required value={studentId} onChange={e=>{setStudentId(Number(e.target.value)||"");const r=rows.find(x=>x.student_id===Number(e.target.value));setPayAmount(r?String(r.due):"");}} className="rounded-xl border p-2.5 text-sm text-slate-900"><option value="">শিক্ষার্থী নির্বাচন</option>{rows.filter(r=>r.due>0).map(r=><option key={r.student_id} value={r.student_id}>{r.student?.name || "শিক্ষার্থী"} — বাকি ৳{money(r.due)}</option>)}</select>
            <input required type="number" min="0.01" step="0.01" value={payAmount} onChange={e=>setPayAmount(e.target.value)} placeholder="টাকার পরিমাণ" className="rounded-xl border p-2.5 text-sm text-slate-900"/>
            <select value={payMethod} onChange={e=>setPayMethod(e.target.value)} className="rounded-xl border p-2.5 text-sm text-slate-900"><option value="cash">নগদ</option><option value="bkash">বিকাশ</option><option value="nagad">নগদ (Nagad)</option><option value="bank">ব্যাংক</option><option value="other">অন্যান্য</option></select>
            <button disabled={busy || activeEvent.status!=="active"} className="rounded-xl bg-teal-700 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy?"সংরক্ষণ…":"জমা নিন"}</button>
          </form>}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4 dark:border-slate-800"><h3 className="font-semibold">শিক্ষার্থীভিত্তিক হিসাব</h3><button onClick={()=>window.print()} className="rounded-lg border px-3 py-1.5 text-sm">প্রিন্ট / PDF</button></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-800"><tr><th className="p-3">শিক্ষার্থী</th><th className="p-3">শ্রেণি</th><th className="p-3 text-right">প্রদেয়</th><th className="p-3 text-right">জমা</th><th className="p-3 text-right">বাকি</th><th className="p-3">অবস্থা</th></tr></thead><tbody>{rows.map(r=><tr key={r.student_id} className="border-t dark:border-slate-800"><td className="p-3 font-medium">{r.student?.name || "—"}<div className="text-xs text-slate-500">{r.student?.student_id || ""}</div></td><td className="p-3">{r.student?.class_name || "—"}</td><td className="p-3 text-right">৳{money(Number(r.payable_amount))}</td><td className="p-3 text-right text-emerald-700">৳{money(r.paid)}</td><td className="p-3 text-right text-red-700">৳{money(r.due)}</td><td className="p-3">{r.status}</td></tr>)}</tbody></table></div>
          </div>
          <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h3 className="mb-3 font-semibold">সাম্প্রতিক লেনদেন</h3>{eventPayments.length===0?<p className="text-sm text-slate-500">এখনও কোনো জমা নেই।</p>:<div className="space-y-2">{eventPayments.map(p=><div key={p.id} className="flex flex-wrap justify-between gap-2 border-b pb-2 text-sm last:border-0 dark:border-slate-800"><div><div className="font-medium">{students.find(s=>s.id===p.student_id)?.name || "শিক্ষার্থী"} · {p.receipt_no}</div><div className="text-xs text-slate-500">{p.payment_date}</div></div><strong>৳{money(Number(p.amount))}</strong></div>)}</div>}</div>
        </>}
      </div>
    </section>
    <p className="text-xs text-slate-500">তৈরি করেছেন: {userName || "অনুমোদিত ব্যবহারকারী"}। ইভেন্ট বন্ধ করলেও পূর্বের লেনদেন সংরক্ষিত থাকবে।</p>
  </main>;
}
