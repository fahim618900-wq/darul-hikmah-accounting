"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import StudentForm from "./student-form";

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
  photo_url: string | null;
};

const CLASSES = [
  "প্লে", "নার্সারি", "প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম",
  "ষষ্ঠ", "সপ্তম", "অষ্টম", "নবম", "দশম", "নূরানী", "নাযেরা", "হিফয",
];

function toBangla(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

export default function StudentList({
  initialStudents,
  userName,
  highlight = "",
  highlightMonth,
  highlightYear,
}: {
  initialStudents: Student[];
  userName: string;
  highlight?: string;
  highlightMonth?: number;
  highlightYear?: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const highlightRef = useRef<HTMLDivElement>(null);

  // হাইলাইট করা আইডি সেট
  const highlightIds = new Set<number>();

  if (highlight === "new" && highlightMonth && highlightYear) {
    initialStudents.forEach((s) => {
      if (!s.admission_date) return;
      const d = new Date(s.admission_date);
      if (d.getMonth() + 1 === highlightMonth && d.getFullYear() === highlightYear) {
        highlightIds.add(s.id);
      }
    });
  } else if (highlight === "discount") {
    initialStudents.forEach((s) => {
      if (Number(s.discount) > 0) highlightIds.add(s.id);
    });
  }

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [loading, setLoading] = useState<number | null>(null);

  // হাইলাইট থাকলে স্ক্রল করি
  useEffect(() => {
    if (highlightIds.size > 0 && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, []);

  const filtered = students.filter((s) => {
    if (classFilter && s.class_name !== classFilter) return false;
    if (statusFilter === "active" && s.status !== "active") return false;
    if (statusFilter === "inactive" && s.status !== "inactive") return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.student_id || "").toLowerCase().includes(q) ||
      (s.roll || "").toLowerCase().includes(q) ||
      (s.guardian_phone || "").includes(q)
    );
  });

  // হাইলাইট করা শিক্ষার্থীরা উপরে দেখাব
  const sorted = [...filtered].sort((a, b) => {
    const aH = highlightIds.has(a.id) ? 1 : 0;
    const bH = highlightIds.has(b.id) ? 1 : 0;
    return bH - aH;
  });

  const firstHighlightIndex = sorted.findIndex((s) => highlightIds.has(s.id));

  async function handleDelete(student: Student) {
    const confirmed = confirm(
      `"${student.name}" কে স্থায়ীভাবে ডিলিট করতে চান?\n\n` +
        `সতর্কতা: এই শিক্ষার্থীর সব বেতন এন্ট্রি ও রেকর্ড স্থায়ীভাবে মুছে যাবে।\n` +
        `এই কাজটি ফিরিয়ে আনা যাবে না।`
    );
    if (!confirmed) return;

    setLoading(student.id);
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", student.id);

    if (error) {
      alert("সমস্যা: " + error.message);
      setLoading(null);
      return;
    }

    setStudents((prev) => prev.filter((s) => s.id !== student.id));
    setLoading(null);
    router.refresh();
  }

  function handleEdit(student: Student) {
    setEditing(student);
    setShowForm(true);
  }

  function handleAddNew() {
    setEditing(null);
    setShowForm(true);
  }

  function handleFormClose(refresh: boolean) {
    setShowForm(false);
    setEditing(null);
    if (refresh) router.refresh();
  }

  const activeCount = students.filter((s) => s.status === "active").length;
  const inactiveCount = students.filter((s) => s.status === "inactive").length;

  return (
    <>
      {showForm && <StudentForm student={editing} onClose={handleFormClose} />}

      <div className="no-print max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        {/* শিরোনাম */}
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
              শিক্ষার্থী ব্যবস্থাপনা
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              মোট {toBangla(students.length)} জন শিক্ষার্থী
            </p>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
  <Link
    href="/dashboard/students/id-cards"
    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium shadow-md shadow-purple-500/25 transition flex items-center gap-1.5"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M15 8h3 M15 12h3 M6 17h12" />
    </svg>
    আইডি কার্ড
  </Link>
  <Link
    href="/dashboard/students/print"
    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium shadow-sm transition flex items-center gap-1.5 hover:bg-slate-50"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
    ক্লাস প্রিন্ট
  </Link>
  <button
    onClick={handleAddNew}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium shadow-md shadow-brand-500/25 transition flex items-center gap-1.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              নতুন
            </button>
          </div>
        </div>

        {/* হাইলাইট বার্তা */}
        {highlight === "new" && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
              নতুন ভর্তি হওয়া শিক্ষার্থীরা হাইলাইট করা হয়েছে — {toBangla(highlightIds.size)} জন
            </span>
          </div>
        )}

        {highlight === "discount" && (
          <div className="mb-4 p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-sm text-purple-700 dark:text-purple-400 font-medium">
              ছাড় পাওয়া শিক্ষার্থীরা হাইলাইট করা হয়েছে — {toBangla(highlightIds.size)} জন
            </span>
          </div>
        )}

        {/* সারাংশ */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-sm" style={{ borderLeftWidth: "3px", borderLeftColor: "#2563eb" }}>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">মোট</div>
            <div className="text-base font-bold text-brand-600">{toBangla(students.length)}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-sm" style={{ borderLeftWidth: "3px", borderLeftColor: "#15803d" }}>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">সক্রিয়</div>
            <div className="text-base font-bold text-emerald-600">{toBangla(activeCount)}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-sm" style={{ borderLeftWidth: "3px", borderLeftColor: "#b91c1c" }}>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">নিষ্ক্রিয়</div>
            <div className="text-base font-bold text-red-600">{toBangla(inactiveCount)}</div>
          </div>
        </div>

        {/* ফিল্টার */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="mb-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম, আইডি, রোল বা ফোন দিয়ে খুঁজুন..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">সব শ্রেণি</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">সব স্ট্যাটাস</option>
              <option value="active">সক্রিয়</option>
              <option value="inactive">নিষ্ক্রিয়</option>
            </select>
          </div>
        </div>

        {classFilter && (
          <div className="mb-3 text-xs text-slate-500 dark:text-slate-400 text-center">
            <strong>{classFilter}</strong> শ্রেণিতে <strong>{toBangla(filtered.length)}</strong> জন
          </div>
        )}
      </div>

      {/* ============ মোবাইল: টেবিল ============ */}
      <div className="md:hidden max-w-7xl mx-auto px-3 sm:px-4 mb-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {sorted.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              {students.length === 0 ? "এখনো কোনো শিক্ষার্থী যোগ করা হয়নি" : "কোনো ফলাফল পাওয়া যায়নি"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[590px] text-xs">
                <thead className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800/80">
                  <tr>
                    <th className="px-3 py-3 text-left font-bold text-slate-600 dark:text-slate-300">শিক্ষার্থীর নাম</th>
                    <th className="px-3 py-3 text-left font-bold text-slate-600 dark:text-slate-300">শ্রেণি / রোল</th>
                    <th className="px-3 py-3 text-right font-bold text-slate-600 dark:text-slate-300">মাসিক বেতন</th>
                    <th className="px-3 py-3 text-center font-bold text-slate-600 dark:text-slate-300">অবস্থা</th>
                    <th className="px-3 py-3 text-center font-bold text-slate-600 dark:text-slate-300">কাজ</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s, i) => {
                    const isActive = s.status === "active";
                    const isH = highlightIds.has(s.id);
                    const isFirstHighlight = isH && i === firstHighlightIndex;
                    return (
                      <tr
                        key={s.id}
                        ref={isFirstHighlight ? (highlightRef as any) : null}
                        className={`border-t border-slate-100 transition hover:bg-teal-50/50 dark:border-slate-800 dark:hover:bg-slate-800/60 ${isH ? "bg-amber-50 dark:bg-amber-900/20" : ""}`}
                      >
                        <td className="px-3 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-100 font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                              {s.photo_url ? <img src={s.photo_url} alt={s.name} className="h-full w-full object-cover" /> : s.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <Link href={`/dashboard/students/${s.id}`} className="block max-w-[180px] truncate text-xs font-bold text-slate-900 hover:text-teal-700 dark:text-white dark:hover:text-teal-300">
                                {s.name}
                              </Link>
                              <span className="mt-0.5 block text-[10px] text-slate-400">{s.student_id || "আইডি নেই"}</span>
                              {isH && <span className="mt-1 inline-flex rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">{highlight === "new" ? "নতুন" : "ছাড়"}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                          <span className="block font-semibold">{s.class_name}{s.section ? ` · ${s.section}` : ""}</span>
                          <span className="mt-1 block text-[10px] text-slate-400">রোল: {s.roll || "—"}</span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">৳{toBangla(s.monthly_fee)}</span>
                          {Number(s.discount || 0) > 0 && <span className="mt-1 block text-[10px] text-amber-600">ছাড় ৳{toBangla(s.discount)}</span>}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold ${isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"}`}>
                            {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => handleEdit(s)} aria-label={s.name + " সম্পাদনা"} className="rounded-lg border border-teal-100 bg-teal-50 px-2 py-1.5 font-semibold text-teal-800 transition hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300">সম্পাদনা</button>
                            <button onClick={() => handleDelete(s)} disabled={loading === s.id} aria-label={s.name + " ডিলিট"} className="rounded-lg border border-rose-100 bg-rose-50 px-2 py-1.5 font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{loading === s.id ? "..." : "ডিলিট"}</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {sorted.length > 0 && <p className="mt-2 text-center text-[11px] text-slate-400">তালিকাটি আড়াআড়ি সরিয়ে সব তথ্য ও কাজের বোতাম দেখুন</p>}
      </div>

      {/* ============ ডেস্কটপ: টেবিল ============ */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {students.length === 0
                ? "এখনো কোনো শিক্ষার্থী যোগ করা হয়নি। উপরে '+ নতুন' বাটনে ক্লিক করুন।"
                : "কোনো ফলাফল পাওয়া যায়নি।"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">আইডি</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">নাম</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">শ্রেণি</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">রোল</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 text-xs">অভিভাবক</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs">মাসিক বেতন</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs">ছাড়</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 text-xs">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 text-xs">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s, idx) => {
                    const isActive = s.status === "active";
                    const badge = isActive
                      ? { bg: "#dcfce7", text: "#15803d" }
                      : { bg: "#fee2e2", text: "#b91c1c" };
                    const isH = highlightIds.has(s.id);
                    const isFirstHighlight = isH && idx === firstHighlightIndex;

                    return (
                      <tr
                        key={s.id}
                        ref={isFirstHighlight ? (highlightRef as any) : null}
                        className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                          isH ? "bg-yellow-50 dark:bg-yellow-900/20" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-slate-500 text-xs">{s.student_id || "-"}</td>
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                              {s.photo_url ? (
                                <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-slate-400 font-bold text-xs">
                                  {s.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <Link href={`/dashboard/students/${s.id}`} className="text-slate-900 dark:text-white hover:text-brand-600 transition">
                              {s.name}
                            </Link>
                            {isH && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-yellow-200 text-yellow-800">
                                {highlight === "new" ? "নতুন" : "ছাড়"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {s.class_name}
                          {s.section && ` (${s.section})`}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.roll || "-"}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                          {s.guardian_name || "-"}
                          {s.guardian_phone && (
                            <div className="text-[10px] text-slate-400">{s.guardian_phone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">৳{toBangla(s.monthly_fee)}</td>
                        <td className="px-4 py-3 text-right text-amber-600">৳{toBangla(s.discount || 0)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: badge.bg, color: badge.text }}>
                            {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleEdit(s)}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-medium hover:bg-brand-100 transition"
                            >
                              সম্পাদনা
                            </button>
                            <button
                              onClick={() => handleDelete(s)}
                              disabled={loading === s.id}
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                            >
                              {loading === s.id ? "..." : "ডিলিট"}
                            </button>
                          </div>
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
    </>
  );
}
