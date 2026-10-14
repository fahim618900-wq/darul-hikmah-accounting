"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import QRCode from "qrcode";

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
  photo_url: string | null;
  gender: string | null;
  blood_group: string | null;
  emergency_contact: string | null;
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

type ColorTheme = {
  primary: string;
  secondary: string;
  gradient: string;
  name: string;
};

function getTheme(gender: string | null, className: string): ColorTheme {
  if (gender === "female") {
    return {
      primary: "#db2777",
      secondary: "#9d174d",
      gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 50%, #9d174d 100%)",
      name: "pink",
    };
  }
  if (gender === "male") {
    return {
      primary: "#1d4ed8",
      secondary: "#1e3a8a",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)",
      name: "blue",
    };
  }
  return {
    primary: "#475569",
    secondary: "#1e293b",
    gradient: "linear-gradient(135deg, #64748b 0%, #475569 50%, #1e293b 100%)",
    name: "slate",
  };
}

export default function IdCardsClient({ students }: { students: Student[] }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [search, setSearch] = useState("");
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({});
  const [generating, setGenerating] = useState(false);
  const [showBack, setShowBack] = useState(true);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass && s.class_name !== selectedClass) return false;
      if (genderFilter !== "all" && s.gender !== genderFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          (s.roll || "").toLowerCase().includes(q) ||
          (s.student_id || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, selectedClass, genderFilter, search]);

  // QR কোড জেনারেট করি
  useEffect(() => {
    if (filtered.length === 0) {
      setQrCodes({});
      return;
    }

    let cancelled = false;
    async function generateQRs() {
      setGenerating(true);
      const codes: Record<number, string> = {};
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://darul-hikmah-accounting.vercel.app";

      for (const s of filtered) {
        if (cancelled) return;
        try {
          const url = `${baseUrl}/dashboard/students/${s.id}`;
          codes[s.id] = await QRCode.toDataURL(url, {
            width: 200,
            margin: 1,
            color: { dark: "#0f172a", light: "#ffffff" },
          });
        } catch (e) {
          console.error("QR error", e);
        }
      }
      if (!cancelled) {
        setQrCodes(codes);
        setGenerating(false);
      }
    }
    generateQRs();
    return () => {
      cancelled = true;
    };
  }, [filtered]);

  function handlePrint() {
    if (filtered.length === 0) {
      alert("প্রথমে ক্লাস সিলেক্ট করুন অথবা শিক্ষার্থী ফিল্টার করুন");
      return;
    }
    window.print();
  }

  return (
    <>
      {/* ==================== স্ক্রিনে কন্ট্রোল ==================== */}
      <div className="no-print max-w-7xl mx-auto px-3 sm:px-4 pt-5 pb-4">
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-medium mb-4 hover:gap-3 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          শিক্ষার্থী তালিকায় ফিরে যান
        </Link>

        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
            শিক্ষার্থী আইডি কার্ড
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            এক ক্লিকে সব শিক্ষার্থীর আইডি কার্ড তৈরি করুন
          </p>
        </div>

        {/* সেটিংস */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                শ্রেণি
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="">সব শ্রেণি</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                লিঙ্গ
              </label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">সব</option>
                <option value="male">ছেলে</option>
                <option value="female">মেয়ে</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                খুঁজুন
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম / রোল / আইডি"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={showBack}
                onChange={(e) => setShowBack(e.target.checked)}
                className="w-4 h-4 accent-brand-600"
              />
              পেছনের দিক দেখাও
            </label>

            <div className="ml-auto flex items-center gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {toBangla(filtered.length)} জন শিক্ষার্থী
                {generating && " • QR তৈরি হচ্ছে..."}
              </div>
              <button
                onClick={handlePrint}
                disabled={filtered.length === 0}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/25 transition flex items-center gap-2 disabled:opacity-50"
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
        </div>
      </div>

      {/* ==================== আইডি কার্ড এরিয়া ==================== */}
      <div className="print-area max-w-7xl mx-auto px-3 sm:px-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-500 text-sm border border-slate-200 dark:border-slate-800">
            কোনো শিক্ষার্থী পাওয়া যায়নি। ক্লাস সিলেক্ট করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 print:grid-cols-2 print:gap-2">
            {filtered.map((s) => (
              <IdCard
                key={s.id}
                student={s}
                qrDataUrl={qrCodes[s.id]}
                showBack={showBack}
              />
            ))}
          </div>
        )}
      </div>

      {/* ==================== প্রিন্ট CSS ==================== */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          .id-card-page {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}

/* ==================== আইডি কার্ড কম্পোনেন্ট ==================== */

function IdCard({
  student,
  qrDataUrl,
  showBack,
}: {
  student: Student;
  qrDataUrl: string | undefined;
  showBack: boolean;
}) {
  const theme = getTheme(student.gender, student.class_name);

  // CR80 card size: 85.6mm × 54mm → aspect ratio 1.586
  // We'll use a slightly bigger version for A4 printing: 88mm × 56mm
  return (
    <div className="id-card-page space-y-2">
      {/* ============ সামনের দিক ============ */}
      <div
        className="id-card-front relative rounded-2xl overflow-hidden shadow-lg print:shadow-none print:rounded-lg"
        style={{
          aspectRatio: "1.586",
          background: "#ffffff",
          border: `2px solid ${theme.primary}`,
        }}
      >
        {/* হেডার স্ট্রিপ */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-1.5"
          style={{
            background: theme.gradient,
            color: "#ffffff",
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-white/25 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <div className="text-[8px] font-bold leading-tight">
                দারুল হিকমাহ মডেল মাদ্রাসা
              </div>
              <div className="text-[6px] leading-tight opacity-90">
                ফুলপুর, ময়মনসিংহ
              </div>
            </div>
          </div>
          <div className="text-[6px] font-semibold bg-white/20 px-1.5 py-0.5 rounded-full">
            শিক্ষার্থী আইডি কার্ড
          </div>
        </div>

        {/* মূল কনটেন্ট */}
        <div className="flex gap-3 pt-10 px-3 pb-3 h-full">
          {/* বাম: ছবি */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div
              className="w-[68px] h-[80px] rounded-lg overflow-hidden flex items-center justify-center bg-slate-100"
              style={{ border: `2px solid ${theme.primary}` }}
            >
              {student.photo_url ? (
                <img
                  src={student.photo_url}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-slate-400 font-bold text-xl">
                  {student.name.charAt(0)}
                </span>
              )}
            </div>
            {student.blood_group && (
              <div
                className="px-2 py-0.5 rounded-full text-[7px] font-bold text-white"
                style={{ background: theme.primary }}
              >
                🩸 {student.blood_group}
              </div>
            )}
          </div>

          {/* ডান: তথ্য */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div
                className="text-[13px] font-bold truncate leading-tight mb-0.5"
                style={{ color: theme.secondary }}
              >
                {student.name}
              </div>
              <div className="flex items-center gap-1.5 text-[8px] mb-1.5">
                <span className="font-semibold" style={{ color: theme.primary }}>
                  {student.class_name}
                </span>
                {student.section && (
                  <span className="text-slate-500">• শাখা {student.section}</span>
                )}
              </div>

              <div className="space-y-0.5 text-[7.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">রোল</span>
                  <span className="font-semibold text-slate-800">
                    {student.roll || "-"}
                  </span>
                </div>
                {student.student_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">আইডি</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {student.student_id}
                    </span>
                  </div>
                )}
                {student.guardian_name && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 shrink-0">অভিভাবক</span>
                    <span className="font-medium text-slate-800 truncate">
                      {student.guardian_name}
                    </span>
                  </div>
                )}
                {student.guardian_phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">মোবাইল</span>
                    <span className="font-semibold text-slate-800">
                      {student.guardian_phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* নিচে: QR + স্বাক্ষর */}
            <div className="flex items-end justify-between gap-2 pt-1">
              <div className="text-[6px] text-slate-500 leading-tight flex-1">
                <div className="border-t border-slate-300 pt-0.5 text-center mt-4">
                  অধ্যক্ষের স্বাক্ষর
                </div>
              </div>
              {qrDataUrl && (
                <div className="shrink-0">
                  <img
                    src={qrDataUrl}
                    alt="QR"
                    className="w-[40px] h-[40px]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* নিচে ফুটার স্ট্রিপ */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center text-[6px] py-0.5 font-medium text-white"
          style={{ background: theme.primary }}
        >
          মোবাইল: ০১৯৭০-৫১৭৫৬৬ | darulhikmahphulpur2025@gmail.com
        </div>
      </div>

      {/* ============ পেছনের দিক ============ */}
      {showBack && (
        <div
          className="id-card-back relative rounded-2xl overflow-hidden shadow-lg print:shadow-none print:rounded-lg"
          style={{
            aspectRatio: "1.586",
            background: "#ffffff",
            border: `2px solid ${theme.primary}`,
          }}
        >
          {/* উপরের স্ট্রিপ */}
          <div
            className="absolute top-0 left-0 right-0 h-4"
            style={{ background: theme.gradient }}
          />

          <div className="pt-6 px-3 pb-3 h-full flex flex-col">
            {/* শিরোনাম */}
            <div
              className="text-[9px] font-bold text-center mb-2"
              style={{ color: theme.secondary }}
            >
              জরুরি তথ্য
            </div>

            <div className="space-y-1 text-[8px] flex-1">
              <BackRow label="শিক্ষার্থীর নাম" value={student.name} />
              <BackRow label="শ্রেণি" value={student.class_name + (student.section ? ` (${student.section})` : "")} />
              {student.roll && <BackRow label="রোল" value={student.roll} />}
              {student.guardian_name && (
                <BackRow label="অভিভাবক" value={student.guardian_name} />
              )}
              {student.guardian_phone && (
                <BackRow label="অভিভাবকের ফোন" value={student.guardian_phone} highlight={theme.primary} />
              )}
              {student.emergency_contact && (
                <BackRow label="জরুরি যোগাযোগ" value={student.emergency_contact} highlight={theme.primary} />
              )}
              {student.blood_group && (
                <BackRow label="রক্তের গ্রুপ" value={student.blood_group} />
              )}
              {student.address && (
                <BackRow label="ঠিকানা" value={student.address} small />
              )}
            </div>

            {/* নিচে মাদ্রাসার তথ্য */}
            <div className="pt-2 mt-2 border-t border-slate-200 text-[6.5px] text-slate-500 leading-tight">
              <div className="text-center font-semibold mb-0.5" style={{ color: theme.primary }}>
                দারুল হিকমাহ মডেল মাদ্রাসা
              </div>
              <div className="text-center">
                ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
              </div>
              <div className="text-center mt-0.5">
                এই কার্ডটি মাদ্রাসার সম্পত্তি। হারিয়ে গেলে অফিসে যোগাযোগ করুন।
              </div>
            </div>
          </div>

          {/* নিচের স্ট্রিপ */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1.5"
            style={{ background: theme.primary }}
          />
        </div>
      )}
    </div>
  );
}

function BackRow({
  label,
  value,
  highlight,
  small,
}: {
  label: string;
  value: string;
  highlight?: string;
  small?: boolean;
}) {
  return (
    <div className="flex gap-1.5 items-start">
      <span className="text-slate-500 shrink-0 min-w-[60px]">{label}</span>
      <span
        className={`flex-1 font-medium text-slate-800 ${small ? "text-[7px]" : ""}`}
        style={highlight ? { color: highlight, fontWeight: "700" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
