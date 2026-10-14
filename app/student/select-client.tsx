"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type PublicStudent = {
  id: number;
  name: string;
  class_name: string;
  roll: string | null;
  section: string | null;
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

export default function StudentSelect() {
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [step, setStep] = useState<"select" | "warning" | "verify">("select");
  const [classFilter, setClassFilter] = useState("");
  const [students, setStudents] = useState<PublicStudent[]>([]);
  const [selected, setSelected] = useState<PublicStudent[]>([]);
  const [phoneLast4, setPhoneLast4] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      const { data: setting } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "student_portal_enabled")
        .single();

      const enabled = setting?.value === "true";
      setPortalEnabled(enabled);

      const savedIds = localStorage.getItem("student_portal_ids");
      if (enabled && savedIds) {
        const ids = JSON.parse(savedIds);
        if (Array.isArray(ids) && ids.length > 0) {
          window.location.href = "/student/view";
          return;
        }
      }

      if (enabled) {
        const { data } = await supabase
          .from("student_public")
          .select("*")
          .order("roll");
        setStudents(data || []);
      }

      setChecking(false);
    }
    init();
  }, []);

  const filteredStudents = classFilter
    ? students.filter((s) => s.class_name === classFilter)
    : [];

  function toggleSelect(student: PublicStudent) {
    setSelected((prev) => {
      if (prev.find((s) => s.id === student.id)) {
        return prev.filter((s) => s.id !== student.id);
      }
      return [...prev, student];
    });
    setError("");
  }

  function handleNext() {
    if (selected.length === 0) {
      setError("অন্তত একটি নাম সিলেক্ট করুন");
      return;
    }
    setError("");
    setStep("warning");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (phoneLast4.length !== 4) {
      setError("৪ ডিজিট দিন");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: err } = await supabase
      .from("students")
      .select("id, guardian_phone")
      .in("id", selected.map((s) => s.id));

    if (err) {
      setError("সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setLoading(false);
      return;
    }

    const matched = data?.some((s) => {
      const phone = (s.guardian_phone || "").replace(/\D/g, "");
      return phone.endsWith(phoneLast4);
    });

    if (!matched) {
      setError("ফোন নম্বরের শেষ ৪ ডিজিট মেলেনি। আবার চেষ্টা করুন।");
      setLoading(false);
      return;
    }

    localStorage.setItem(
      "student_portal_ids",
      JSON.stringify(selected.map((s) => s.id))
    );
    localStorage.setItem(
      "student_portal_names",
      JSON.stringify(selected.map((s) => s.name))
    );

    window.location.href = "/student/view";
  }

  if (checking) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!portalEnabled) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-red-600 mb-3">
          শিক্ষার্থী পোর্টাল বন্ধ
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          শিক্ষার্থী পোর্টাল বর্তমানে বন্ধ রাখা হয়েছে।
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          অনুগ্রহ করে মাদ্রাসার Admin-এর সাথে যোগাযোগ করুন।
        </p>
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400">
            দারুল হিকমাহ মডেল মাদ্রাসা — শিক্ষার্থী পোর্টাল
          </p>
        </div>
      </div>
    );
  }

  // ==================== ধাপ ১: নাম সিলেক্ট ====================
  if (step === "select") {
    return (
      <div className="space-y-4">
        {/* হেডার */}
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
            দারুল হিকমাহ মডেল মাদ্রাসা
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            শিক্ষার্থী পোর্টাল
          </p>
        </div>

        {/* ধাপ নির্দেশক */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <StepIndicator number={1} label="নাম" active />
          <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700" />
          <StepIndicator number={2} label="সতর্কতা" />
          <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700" />
          <StepIndicator number={3} label="যাচাই" />
        </div>

        {/* মূল কার্ড */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
            আপনার পরিচয় নির্বাচন করুন
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5">
            প্রথমে শ্রেণি নির্বাচন করুন, তারপর নিজের নাম সিলেক্ট করুন
          </p>

          {/* শ্রেণি নির্বাচন */}
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            শ্রেণি নির্বাচন করুন
          </label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition"
          >
            <option value="">-- শ্রেণি বেছে নিন --</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* শিক্ষার্থী তালিকা */}
          {classFilter && (
            <div className="mt-4">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  এই শ্রেণিতে কোনো শিক্ষার্থী নেই
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredStudents.map((s) => {
                    const isSelected = selected.find((x) => x.id === s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleSelect(s)}
                        className={`w-full text-left px-3 py-3 rounded-2xl border-2 transition flex items-center gap-3 ${
                          isSelected
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-300 dark:hover:border-brand-700"
                        }`}
                      >
                        {/* চেকবক্স */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition ${
                            isSelected
                              ? "bg-brand-600 text-white"
                              : "border-2 border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {isSelected && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>

                        {/* ছবি */}
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
                          {s.photo_url ? (
                            <img
                              src={s.photo_url}
                              alt={s.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-bold text-base">
                              {s.name.charAt(0)}
                            </span>
                          )}
                        </div>

                        {/* তথ্য */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate text-sm">
                            {s.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span className="font-medium">{s.class_name}</span>
                            {s.roll && <span>• রোল {s.roll}</span>}
                            {s.section && <span>• {s.section}</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* নির্বাচিত তালিকা */}
          {selected.length > 0 && (
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/40">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  নির্বাচিত ({toBangla(selected.length)} জন)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selected.map((s) => (
                  <span
                    key={s.id}
                    className="px-2 py-1 rounded-full bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {s.photo_url ? (
                        <img
                          src={s.photo_url}
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400 text-[9px] font-bold">
                          {s.name.charAt(0)}
                        </span>
                      )}
                    </span>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* পরবর্তী ধাপ বাটন */}
          <button
            onClick={handleNext}
            disabled={selected.length === 0}
            className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            পরবর্তী ধাপ
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ==================== ধাপ ২: সতর্কবার্তা ====================
  if (step === "warning") {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            দারুল হিকমাহ মডেল মাদ্রাসা
          </h1>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <StepIndicator number={1} label="নাম" done />
          <div className="w-8 h-0.5 bg-brand-500" />
          <StepIndicator number={2} label="সতর্কতা" active />
          <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700" />
          <StepIndicator number={3} label="যাচাই" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border-2 border-red-200 dark:border-red-800/40 shadow-xl">
          {/* হেডার */}
          <div className="bg-gradient-to-br from-red-500 to-rose-600 p-5 sm:p-6 text-center text-white">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold">কঠোর সতর্কবার্তা</h2>
            <p className="text-xs opacity-90 mt-1">অনুগ্রহ করে মনোযোগ দিয়ে পড়ুন</p>
          </div>

          {/* বার্তা */}
          <div className="p-5 sm:p-6">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-900/40 mb-5">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-3">
                এই পোর্টালে শুধু নিজের এবং আপনার ভাই/বোনের তথ্য দেখার অনুমতি আছে।
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-2">
                অন্যের তথ্য দেখার চেষ্টা করলে:
              </p>
              <ul className="space-y-1.5 text-xs text-red-700 dark:text-red-400">
                <li className="flex gap-2 items-start">
                  <span className="text-red-500 mt-0.5">✗</span>
                  আপনার নিজের তথ্যও দেখা বন্ধ হয়ে যাবে
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-red-500 mt-0.5">✗</span>
                  আপনার অ্যাক্সেস স্থায়ীভাবে বন্ধ হয়ে যাবে
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-red-500 mt-0.5">✗</span>
                  মাদ্রাসা কর্তৃপক্ষ কোনো দায় নেবে না
                </li>
              </ul>
            </div>

            {/* নির্বাচিত শিক্ষার্থী */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-5">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                আপনি নির্বাচন করেছেন:
              </p>
              <div className="space-y-2">
                {selected.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {s.photo_url ? (
                        <img
                          src={s.photo_url}
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">
                          {s.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {s.class_name}
                        {s.roll && ` • রোল ${s.roll}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium text-center mb-4">
              আপনি কি নিশ্চিত?
            </p>

            {/* বাটন */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStep("select")}
                className="py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 transition"
              >
                ← ফিরে যান
              </button>
              <button
                onClick={() => setStep("verify")}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-bold shadow-lg shadow-red-500/25 transition"
              >
                হ্যাঁ, নিশ্চিত ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ধাপ ৩: যাচাই ====================
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          দারুল হিকমাহ মডেল মাদ্রাসা
        </h1>
      </div>

      <div className="flex items-center justify-center gap-2 mb-2">
        <StepIndicator number={1} label="নাম" done />
        <div className="w-8 h-0.5 bg-brand-500" />
        <StepIndicator number={2} label="সতর্কতা" done />
        <div className="w-8 h-0.5 bg-brand-500" />
        <StepIndicator number={3} label="যাচাই" active />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            পরিচয় যাচাই
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            অভিভাবকের মোবাইল নম্বরের <strong>শেষ ৪ ডিজিট</strong> দিন
          </p>
        </div>

        {/* নির্বাচিত শিক্ষার্থীদের ছোট ছবি */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {selected.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-brand-100 dark:border-brand-900/40">
                {s.photo_url ? (
                  <img
                    src={s.photo_url}
                    alt={s.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 font-bold text-base">
                    {s.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium max-w-[60px] truncate">
                {s.name}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleVerify}>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 text-center">
            শেষ ৪ ডিজিট
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={phoneLast4}
            onChange={(e) =>
              setPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="১২৩৪"
            required
            autoFocus
            className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition"
          />

          {error && (
            <div className="mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <div className="mt-5 space-y-2">
            <button
              type="submit"
              disabled={loading || phoneLast4.length !== 4}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  যাচাই হচ্ছে...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  যাচাই করুন
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("select")}
              className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-50 transition"
            >
              ← ফিরে যান
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-4">
            শিক্ষার্থীর তথ্য নিরাপদ রাখতে এটি প্রয়োজন
          </p>
        </form>
      </div>
    </div>
  );
}

/* ==================== স্টেপ ইন্ডিকেটর ==================== */
function StepIndicator({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
          done
            ? "bg-brand-600 text-white"
            : active
            ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 ring-2 ring-brand-500"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
        }`}
      >
        {done ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          toBangla(number)
        )}
      </div>
      <span
        className={`text-[10px] font-medium ${
          active || done
            ? "text-brand-600 dark:text-brand-400"
            : "text-slate-400 dark:text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
