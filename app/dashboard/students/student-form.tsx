"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  photo_url?: string | null;
  gender?: string | null;
  blood_group?: string | null;
  emergency_contact?: string | null;
};

const CLASSES = [
  "প্লে", "নার্সারি", "প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম",
  "ষষ্ঠ", "সপ্তম", "অষ্টম", "নবম", "দশম", "নূরানী", "নাযেরা", "হিফয",
];

export default function StudentForm({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: (refresh: boolean) => void;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    student_id: student?.student_id || "",
    name: student?.name || "",
    class_name: student?.class_name || "প্রথম",
    section: student?.section || "",
    roll: student?.roll || "",
    guardian_name: student?.guardian_name || "",
    guardian_phone: student?.guardian_phone || "",
    address: student?.address || "",
    admission_date: student?.admission_date || new Date().toISOString().split("T")[0],
    monthly_fee: student?.monthly_fee || 0,
    discount: student?.discount || 0,
    discount_reason: student?.discount_reason || "",
    status: student?.status || "active",
    photo_url: student?.photo_url || "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(student?.photo_url || "");

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // ফাইল সাইজ চেক (২MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("ছবির সাইজ ২MB এর কম হতে হবে");
      return;
    }

    // টাইপ চেক
    if (!file.type.startsWith("image/")) {
      setError("শুধু ছবি ফাইল আপলোড করুন");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError("ছবি আপলোডে সমস্যা: " + uploadError.message);
        setUploading(false);
        return;
      }

      // Public URL তৈরি
      const { data: urlData } = supabase.storage
        .from("student-photos")
        .getPublicUrl(data.path);

      setForm((prev) => ({ ...prev, photo_url: urlData.publicUrl }));
      setPhotoPreview(urlData.publicUrl);
    } catch (err: any) {
      setError("ছবি আপলোডে সমস্যা: " + (err?.message || "অজানা ত্রুটি"));
    }

    setUploading(false);
  }

  async function removePhoto() {
    if (!confirm("ছবি মুছে ফেলতে চান?")) return;

    // Storage থেকে ডিলিট
    if (form.photo_url && form.photo_url.includes("student-photos")) {
      try {
        const path = form.photo_url.split("student-photos/")[1];
        if (path) {
          await supabase.storage.from("student-photos").remove([path]);
        }
      } catch (e) {
        // ignore
      }
    }

    setForm((prev) => ({ ...prev, photo_url: "" }));
    setPhotoPreview("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      monthly_fee: Number(form.monthly_fee) || 0,
      discount: Number(form.discount) || 0,
      photo_url: form.photo_url || null,
    };

    let result;
    if (student) {
      result = await supabase.from("students").update(payload).eq("id", student.id);
    } else {
      result = await supabase.from("students").insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onClose(true);
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={() => onClose(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* হেডার */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {student ? "শিক্ষার্থীর তথ্য সম্পাদনা" : "নতুন শিক্ষার্থী যোগ"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              নিচের তথ্যগুলো পূরণ করুন
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0 ml-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-5 py-5 space-y-6">
            {/* ============ ছবি ============ */}
            <Section title="শিক্ষার্থীর ছবি" icon="photo">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border-2 border-dashed border-slate-300 dark:border-slate-700">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="ছবি"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <label className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-sm transition cursor-pointer flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {uploading ? "আপলোড..." : photoPreview ? "পরিবর্তন" : "ছবি আপলোড"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 transition flex items-center gap-1.5"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        </svg>
                        মুছুন
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    JPG, PNG — সর্বোচ্চ ২MB। বর্গাকার ছবি ভালো দেখায়।
                  </p>
                </div>
              </div>
            </Section>

            {/* ============ সেকশন ১: মৌলিক তথ্য ============ */}
            <Section title="মৌলিক তথ্য" icon="user">
              <Field label="শিক্ষার্থীর নাম" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  placeholder="যেমন: আহমাদ আব্দুল্লাহ"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="শ্রেণি" required>
                  <select
                    value={form.class_name}
                    onChange={(e) => update("class_name", e.target.value)}
                    required
                    className={inputClass}
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="শাখা">
                  <input
                    type="text"
                    value={form.section}
                    onChange={(e) => update("section", e.target.value)}
                    placeholder="ক, খ"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="রোল নম্বর">
                  <input
                    type="text"
                    value={form.roll}
                    onChange={(e) => update("roll", e.target.value)}
                    placeholder="১, ২, ৩..."
                    className={inputClass}
                  />
                </Field>
                <Field label="শিক্ষার্থী আইডি">
                  <input
                    type="text"
                    value={form.student_id}
                    onChange={(e) => update("student_id", e.target.value)}
                    placeholder="যেমন: ST-001"
                    className={inputClass}
                  />
                </Field>
              </div>
            </Section>

            {/* ============ সেকশন ২: অভিভাবকের তথ্য ============ */}
            <Section title="অভিভাবকের তথ্য" icon="family">
              <Field label="অভিভাবকের নাম">
                <input
                  type="text"
                  value={form.guardian_name}
                  onChange={(e) => update("guardian_name", e.target.value)}
                  placeholder="পিতার বা অভিভাবকের নাম"
                  className={inputClass}
                />
              </Field>

              <Field label="মোবাইল নম্বর" hint="এই নম্বর দিয়েই শিক্ষার্থী পোর্টালে যাচাই হবে">
                <input
                  type="tel"
                  value={form.guardian_phone}
                  onChange={(e) => update("guardian_phone", e.target.value)}
                  placeholder="০১XXXXXXXXX"
                  className={inputClass}
                />
              </Field>

              <Field label="ঠিকানা">
                <textarea
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  rows={2}
                  placeholder="গ্রাম, ডাকঘর, উপজেলা"
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </Section>

            {/* ============ সেকশন ৩: বেতন ও ভর্তি ============ */}
            <Section title="বেতন ও ভর্তি" icon="money">
              <Field label="ভর্তি তারিখ">
                <input
                  type="date"
                  value={form.admission_date}
                  onChange={(e) => update("admission_date", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="মাসিক বেতন (৳)" required>
                  <input
                    type="number"
                    value={form.monthly_fee}
                    onChange={(e) => update("monthly_fee", e.target.value)}
                    required
                    min={0}
                    placeholder="০"
                    className={inputClass}
                  />
                </Field>
                <Field label="ছাড় (৳)">
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) => update("discount", e.target.value)}
                    min={0}
                    placeholder="০"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="ছাড়ের কারণ">
                <input
                  type="text"
                  value={form.discount_reason}
                  onChange={(e) => update("discount_reason", e.target.value)}
                  placeholder="যেমন: এতিম, মেধাবী"
                  className={inputClass}
                />
              </Field>

              <Field label="স্ট্যাটাস">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => update("status", "active")}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition border-2 ${
                      form.status === "active"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300"
                    }`}
                  >
                    সক্রিয়
                  </button>
                  <button
                    type="button"
                    onClick={() => update("status", "inactive")}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition border-2 ${
                      form.status === "inactive"
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300"
                    }`}
                  >
                    নিষ্ক্রিয়
                  </button>
                </div>
              </Field>
            </Section>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* নিচে স্টিকি অ্যাকশন বার */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-5 py-4 flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
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
                  {student ? "আপডেট করুন" : "যোগ করুন"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==================== সহায়ক কম্পোনেন্ট ==================== */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: "user" | "family" | "money" | "photo";
  children: React.ReactNode;
}) {
  const icons = {
    user: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    family: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    money: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
    photo: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
          {icons[icon]}
        </div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {title}
        </h4>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-[10px] text-slate-400 mt-1">{hint}</p>
      )}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition";
