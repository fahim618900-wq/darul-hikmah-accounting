"use client";

import { useState } from "react";
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
}: {
  initialStudents: Student[];
  userName: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [loading, setLoading] = useState<number | null>(null);

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
          <div className="flex gap-2 shrink-0">
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

      {/* ============ মোবাইল: কার্ড ============ */}
      <div className="md:hidden max-w-7xl mx-auto px-3 sm:px-4 space-y-2.5 mb-6">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500 text-sm border border-slate-200 dark:border-slate-800">
            {students.length === 0
              ? "এখনো কোনো শিক্ষার্থী যোগ করা হয়নি"
              : "কোনো ফলাফল পাওয়া যায়নি"}
          </div>
        ) : (
          filtered.map((s, i) => {
            const isActive = s.status === "active";
            const accent = isActive ? "#15803d" : "#b91c1c";
            const bg = isActive ? "#f0fdf4" : "#fef2f2";
            const badge = isActive ? "#dcfce7" : "#fee2e2";

            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
                style={{ borderLeftWidth: "4px", borderLeftColor: accent }}
              >
                {/* হেডার */}
                <div className="px-4 py-3 flex items-start justify-between gap-3" style={{ background: bg }}>
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-sm">
                      {s.photo_url ? (
                        <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-400 font-bold text-sm">
                          {s.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-slate-400">
                          {toBangla(i + 1)}.
                        </span>
                        <Link
                          href={`/dashboard/students/${s.id}`}
                          className="text-[15px] font-semibold text-slate-900 truncate hover:text-brand-600 transition"
                        >
                          {s.name}
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500">
                        <span className="font-medium">{s.class_name}</span>
                        {s.section && <span>• {s.section}</span>}
                        {s.roll && <span>• রোল {s.roll}</span>}
                      </div>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                    style={{ background: badge, color: accent }}
                  >
                    {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </span>
                </div>

                {/* তথ্য */}
                <div className="px-4 py-3 grid grid-cols-3 gap-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400 mb-0.5">আইডি</div>
                    <div className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {s.student_id || "-"}
                    </div>
                  </div>
                  <div className="text-center border-x border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-0.5">মাসিক বেতন</div>
                    <div className="text-[12px] font-bold text-emerald-600">
                      ৳{toBangla(s.monthly_fee)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400 mb-0.5">ছাড়</div>
                    <div className="text-[12px] font-semibold text-amber-600">
                      ৳{toBangla(s.discount || 0)}
                    </div>
                  </div>
                </div>

                {/* অভিভাবক */}
                {s.guardian_name && (
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                    <span className="text-slate-400">অভিভাবক:</span>{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">{s.guardian_name}</span>
                    {s.guardian_phone && (
                      <span className="ml-2 text-slate-500">({s.guardian_phone})</span>
                    )}
                  </div>
                )}

                {/* অ্যাকশন বাটন */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
                  <Link
                    href={`/dashboard/students/${s.id}`}
                    className="py-2.5 text-[12px] font-medium text-brand-700 hover:bg-brand-50 transition flex items-center justify-center gap-1"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    দেখুন
                  </Link>
                  <button
                    onClick={() => handleEdit(s)}
                    className="py-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    সম্পাদনা
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    disabled={loading === s.id}
                    className="py-2.5 text-[12px] font-medium text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                    {loading === s.id ? "..." : "ডিলিট"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============ ডেস্কটপ: টেবিল ============ */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
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
                  {filtered.map((s) => {
                    const isActive = s.status === "active";
                    const badge = isActive
                      ? { bg: "#dcfce7", text: "#15803d" }
                      : { bg: "#fee2e2", text: "#b91c1c" };
                    return (
                      <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
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
