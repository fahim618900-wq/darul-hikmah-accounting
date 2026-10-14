"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
  admission_date: string | null;
  monthly_fee: number;
  discount: number;
  status: string;
  photo_url: string | null;
};

type Template = {
  id: number;
  name: string;
  class_name: string | null;
  columns: any;
  show_qr: boolean;
  show_photo: boolean;
  orientation: string;
};

type CustomColumn = {
  id: string;
  title: string;
  width: string;
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

function todayBangla(): string {
  const d = new Date();
  return `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())}`;
}

export default function PrintClient({
  students,
  templates,
}: {
  students: Student[];
  templates: Template[];
}) {
  const supabase = createClient();
  const printRef = useRef<HTMLDivElement>(null);

  const [selectedClass, setSelectedClass] = useState("");
  const [showQR, setShowQR] = useState(true);
  const [showPhoto, setShowPhoto] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({});

  const classes = Array.from(new Set(students.map((s) => s.class_name)));

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => s.class_name === selectedClass);
  }, [students, selectedClass]);

  // QR কোড জেনারেট করি
  useEffect(() => {
    if (!showQR || filteredStudents.length === 0) {
      setQrCodes({});
      return;
    }

    async function generateQRs() {
      const codes: Record<number, string> = {};
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://darul-hikmah-accounting.vercel.app";

      for (const s of filteredStudents) {
        try {
          const url = `${baseUrl}/dashboard/students/${s.id}`;
          codes[s.id] = await QRCode.toDataURL(url, {
            width: 120,
            margin: 1,
            color: { dark: "#0f172a", light: "#ffffff" },
          });
        } catch (e) {
          console.error("QR error", e);
        }
      }
      setQrCodes(codes);
    }
    generateQRs();
  }, [filteredStudents, showQR]);

  function addColumn() {
    setCustomColumns([
      ...customColumns,
      {
        id: `col-${Date.now()}`,
        title: "নতুন কলাম",
        width: "80",
      },
    ]);
  }

  function updateColumn(id: string, field: keyof CustomColumn, value: string) {
    setCustomColumns(
      customColumns.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  function removeColumn(id: string) {
    setCustomColumns(customColumns.filter((c) => c.id !== id));
  }

  function moveColumn(id: string, direction: "up" | "down") {
    const idx = customColumns.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const newCols = [...customColumns];
    if (direction === "up" && idx > 0) {
      [newCols[idx - 1], newCols[idx]] = [newCols[idx], newCols[idx - 1]];
    } else if (direction === "down" && idx < newCols.length - 1) {
      [newCols[idx + 1], newCols[idx]] = [newCols[idx], newCols[idx + 1]];
    }
    setCustomColumns(newCols);
  }

  async function loadTemplate(t: Template) {
    setSelectedClass(t.class_name || "");
    setShowQR(t.show_qr);
    setShowPhoto(t.show_photo);
    setOrientation((t.orientation as any) || "landscape");
    setCustomColumns(Array.isArray(t.columns) ? t.columns : []);
  }

  async function saveTemplate() {
    if (!templateName.trim()) {
      alert("টেমপ্লেটের নাম দিন");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("print_templates").insert({
      name: templateName,
      class_name: selectedClass || null,
      columns: customColumns,
      show_qr: showQR,
      show_photo: showPhoto,
      orientation,
      created_by: user?.id,
    });

    if (error) {
      alert("সমস্যা: " + error.message);
      return;
    }

    alert("টেমপ্লেট সেভ হয়েছে");
    setShowSaveModal(false);
    setTemplateName("");
    window.location.reload();
  }

  async function deleteTemplate(id: number) {
    if (!confirm("এই টেমপ্লেট ডিলিট করতে চান?")) return;
    const { error } = await supabase.from("print_templates").delete().eq("id", id);
    if (error) {
      alert("সমস্যা: " + error.message);
      return;
    }
    window.location.reload();
  }

  function handlePrint() {
    if (!selectedClass) {
      alert("প্রথমে একটি ক্লাস সিলেক্ট করুন");
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
            ক্লাস প্রিন্ট সিস্টেম
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            ক্লাস সিলেক্ট করে কাস্টম কলাম যোগ করে প্রিন্ট করুন
          </p>
        </div>

        {/* ============ সেটিংস ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* বাম: ক্লাস সিলেকশন */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              ১. ক্লাস সিলেক্ট করুন
            </h3>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none mb-2"
            >
              <option value="">-- ক্লাস --</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {selectedClass && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                এই ক্লাসে <strong>{toBangla(filteredStudents.length)}</strong> জন শিক্ষার্থী
              </div>
            )}
          </div>

          {/* মাঝে: অপশন */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              ২. অপশন
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQR}
                  onChange={(e) => setShowQR(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  QR কোড দেখাও
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPhoto}
                  onChange={(e) => setShowPhoto(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  ছবি দেখাও (যদি থাকে)
                </span>
              </label>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  প্রিন্ট ওরিয়েন্টেশন
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="landscape">Landscape (লম্বা)</option>
                  <option value="portrait">Portrait (খাড়া)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ডানে: টেমপ্লেট */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              ৩. সেভ করা টেমপ্লেট
            </h3>
            {templates.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">
                কোনো টেমপ্লেট নেই
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    <button
                      onClick={() => loadTemplate(t)}
                      className="flex-1 text-left text-xs font-medium text-slate-700 dark:text-slate-300 truncate"
                    >
                      {t.name}
                      {t.class_name && (
                        <span className="text-slate-400 ml-1">({t.class_name})</span>
                      )}
                    </button>
                    <button
                      onClick={() => deleteTemplate(t.id)}
                      className="text-red-500 hover:text-red-700 shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowSaveModal(true)}
              className="w-full mt-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              + বর্তমান লেআউট সেভ করুন
            </button>
          </div>
        </div>

        {/* ============ কাস্টম কলাম ============ */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              ৪. কাস্টম কলাম যোগ করুন
            </h3>
            <button
              onClick={addColumn}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              কলাম যোগ
            </button>
          </div>

          {customColumns.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">
              এখনো কোনো কাস্টম কলাম নেই। যোগ করতে উপরের বাটনে ক্লিক করুন।
            </p>
          ) : (
            <div className="space-y-2">
              {customColumns.map((col, idx) => (
                <div
                  key={col.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800"
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveColumn(col.id, "up")}
                      disabled={idx === 0}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveColumn(col.id, "down")}
                      disabled={idx === customColumns.length - 1}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={col.title}
                    onChange={(e) => updateColumn(col.id, "title", e.target.value)}
                    placeholder="কলামের নাম"
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <input
                    type="number"
                    value={col.width}
                    onChange={(e) => updateColumn(col.id, "width", e.target.value)}
                    placeholder="প্রস্থ"
                    min="40"
                    max="200"
                    className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    onClick={() => removeColumn(col.id)}
                    className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center hover:bg-red-100 transition"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============ প্রিন্ট বাটন ============ */}
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            disabled={!selectedClass}
            className="flex-1 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / PDF
          </button>
        </div>
      </div>

      {/* ==================== সেভ মডাল ==================== */}
      {showSaveModal && (
        <div
          onClick={() => setShowSaveModal(false)}
          className="no-print fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              টেমপ্লেট সেভ করুন
            </h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="যেমন: চতুর্থ শ্রেণি উপস্থিতি"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400"
              >
                বাতিল
              </button>
              <button
                onClick={saveTemplate}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
              >
                সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== প্রিন্ট এরিয়া ==================== */}
      <div ref={printRef} className="hidden print:block print-area">
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f766e", marginBottom: "4px" }}>
            দারুল হিকমাহ মডেল মাদ্রাসা
          </h1>
          <p style={{ fontSize: "11px", color: "#475569" }}>
            ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "12px" }}>
          <div><strong>ক্লাস:</strong> {selectedClass} | <strong>মোট শিক্ষার্থী:</strong> {toBangla(filteredStudents.length)} জন</div>
          <div><strong>তারিখ:</strong> {todayBangla()}</div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr style={{ background: "#0f766e", color: "#ffffff" }}>
              <th style={{ border: "1px solid #999", padding: "5px", width: "40px" }}>ক্রম</th>
              {showPhoto && <th style={{ border: "1px solid #999", padding: "5px", width: "50px" }}>ছবি</th>}
              {showQR && <th style={{ border: "1px solid #999", padding: "5px", width: "60px" }}>QR</th>}
              <th style={{ border: "1px solid #999", padding: "5px", width: "60px" }}>রোল</th>
              <th style={{ border: "1px solid #999", padding: "5px" }}>নাম</th>
              <th style={{ border: "1px solid #999", padding: "5px" }}>পিতার নাম</th>
              <th style={{ border: "1px solid #999", padding: "5px" }}>মোবাইল</th>
              {customColumns.map((col) => (
                <th
                  key={col.id}
                  style={{
                    border: "1px solid #999",
                    padding: "5px",
                    width: `${col.width}px`,
                  }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s, i) => (
              <tr key={s.id}>
                <td style={{ border: "1px solid #999", padding: "4px", textAlign: "center" }}>
                  {toBangla(i + 1)}
                </td>
                {showPhoto && (
                  <td style={{ border: "1px solid #999", padding: "4px", textAlign: "center" }}>
                    {s.photo_url ? (
                      <img
                        src={s.photo_url}
                        alt={s.name}
                        style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "4px" }}
                      />
                    ) : (
                      <span style={{ fontSize: "9px", color: "#94a3b8" }}>নেই</span>
                    )}
                  </td>
                )}
                {showQR && (
                  <td style={{ border: "1px solid #999", padding: "4px", textAlign: "center" }}>
                    {qrCodes[s.id] ? (
                      <img
                        src={qrCodes[s.id]}
                        alt="QR"
                        style={{ width: "40px", height: "40px" }}
                      />
                    ) : (
                      <span style={{ fontSize: "8px", color: "#94a3b8" }}>...</span>
                    )}
                  </td>
                )}
                <td style={{ border: "1px solid #999", padding: "4px", textAlign: "center" }}>
                  {s.roll || "-"}
                </td>
                <td style={{ border: "1px solid #999", padding: "4px", fontWeight: "500" }}>
                  {s.name}
                </td>
                <td style={{ border: "1px solid #999", padding: "4px" }}>
                  {s.guardian_name || "-"}
                </td>
                <td style={{ border: "1px solid #999", padding: "4px" }}>
                  {s.guardian_phone || "-"}
                </td>
                {customColumns.map((col) => (
                  <td
                    key={col.id}
                    style={{
                      border: "1px solid #999",
                      padding: "4px",
                      height: "24px",
                    }}
                  >
                    &nbsp;
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "30px", fontSize: "11px", textAlign: "right" }}>
          <span style={{ borderTop: "1px solid #475569", paddingTop: "4px", display: "inline-block", minWidth: "150px", textAlign: "center" }}>
            শ্রেণি শিক্ষকের স্বাক্ষর
          </span>
        </div>
      </div>

      {/* ============ প্রিন্ট CSS ============ */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 ${orientation};
            margin: 10mm;
          }
        }
      `}</style>
    </>
  );
}
