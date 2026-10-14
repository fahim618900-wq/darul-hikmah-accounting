"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Setting = { key: string; value: string | null };

export default function SettingsClient({ settings }: { settings: Setting[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [signupEnabled, setSignupEnabled] = useState(
    settings.find((s) => s.key === "signup_enabled")?.value === "true"
  );
  const [portalEnabled, setPortalEnabled] = useState(
    settings.find((s) => s.key === "student_portal_enabled")?.value === "true"
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function updateSetting(key: string, value: string) {
    const { data: existing } = await supabase
      .from("app_settings")
      .select("key")
      .eq("key", key)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("app_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("app_settings")
        .insert({ key, value });
      if (error) throw error;
    }
  }

  async function handleSave() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await updateSetting("signup_enabled", signupEnabled ? "true" : "false");
      await updateSetting("student_portal_enabled", portalEnabled ? "true" : "false");
      setMessage("সেটিংস সফলভাবে সংরক্ষিত হয়েছে");
      router.refresh();
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setError("সমস্যা: " + (e?.message || "অজানা ত্রুটি"));
    }

    setLoading(false);
  }

  const changed =
    signupEnabled !== (settings.find((s) => s.key === "signup_enabled")?.value === "true") ||
    portalEnabled !== (settings.find((s) => s.key === "student_portal_enabled")?.value === "true");

  return (
    <div className="max-w-3xl">
      {/* সফল/এরর মেসেজ */}
      {message && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* অ্যাকাউন্ট সেকশন */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">অ্যাকাউন্ট</h3>
            <p className="text-[11px] text-slate-500">নিবন্ধন ও নতুন ব্যবহারকারী</p>
          </div>
        </div>

        <div className="p-5">
          <SettingToggle
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            }
            title="নতুন অ্যাকাউন্ট খোলা চালু"
            description="বন্ধ থাকলে কেউ নতুন অ্যাকাউন্ট খুলতে পারবে না"
            enabled={signupEnabled}
            onToggle={() => setSignupEnabled(!signupEnabled)}
            color="brand"
          />
        </div>
      </div>

      {/* শিক্ষার্থী পোর্টাল সেকশন */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">শিক্ষার্থী পোর্টাল</h3>
            <p className="text-[11px] text-slate-500">শিক্ষার্থীদের অ্যাক্সেস নিয়ন্ত্রণ</p>
          </div>
        </div>

        <div className="p-5">
          <SettingToggle
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
            title="শিক্ষার্থী পোর্টাল চালু"
            description="বন্ধ থাকলে শিক্ষার্থীরা পোর্টালে ঢুকতে পারবে না"
            enabled={portalEnabled}
            onToggle={() => setPortalEnabled(!portalEnabled)}
            color="purple"
          />
        </div>
      </div>

      {/* সংরক্ষণ বাটন */}
      <div className="sticky bottom-20 lg:bottom-4 z-20">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex-1">
              {changed ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  ⚠ পরিবর্তন সংরক্ষণ করা হয়নি
                </span>
              ) : (
                <span>সব সেটিংস সংরক্ষিত</span>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={loading || !changed}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  সংরক্ষণ...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  সংরক্ষণ করুন
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({
  icon,
  title,
  description,
  enabled,
  onToggle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  color: "brand" | "purple";
}) {
  const colorClass = color === "brand" ? "bg-brand-600" : "bg-purple-600";

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          enabled
            ? color === "brand"
              ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400"
              : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
            {title}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </div>
          <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            enabled
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-red-500"}`} />
            {enabled ? "চালু" : "বন্ধ"}
          </div>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`relative shrink-0 w-14 h-8 rounded-full transition-colors ${
          enabled ? colorClass : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
            enabled ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
