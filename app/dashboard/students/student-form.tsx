"use client";

import { useState, useEffect } from "react";
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
};

const CLASSES = [
  "প্লে",
  "নার্সারি",
  "প্রথম",
  "দ্বিতীয়",
  "তৃতীয়",
  "চতুর্থ",
  "পঞ্চম",
  "ষষ্ঠ",
  "সপ্তম",
  "অষ্টম",
  "নবম",
  "দশম",
  "নূরানী",
  "নাযেরা",
  "হিফয",
];

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

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
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prevent background scroll while modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      monthly_fee: Number(form.monthly_fee) || 0,
      discount: Number(form.discount) || 0,
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

  const isEdit = !!student;

  return (
    <div className="sf-backdrop" onClick={() => onClose(false)}>
      <style>{`
        .sf-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 0;
          overflow-y: auto;
          z-index: 50;
          animation: sf-fade 0.15s ease-out;
        }
        @keyframes sf-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .sf-modal {
          background: #ffffff;
          width: 100%;
          max-width: 640px;
          min-height: 100vh;
          padding: 1.15rem 1rem 6rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          animation: sf-slide 0.18s ease-out;
          position: relative;
          box-sizing: border-box;
        }
        @keyframes sf-slide {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .sf-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 1.1rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .sf-title {
          font-size: 1.1rem;
          color: #0f766e;
          margin: 0;
          font-weight: 700;
          line-height: 1.3;
        }
        .sf-subtitle {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.2rem;
        }
        .sf-close {
          background: #f1f5f9;
          border: none;
          color: #475569;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .sf-close:hover { background: #e2e8f0; }

        .sf-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        .sf-field label {
          display: block;
          margin-bottom: 0.3rem;
          font-size: 0.78rem;
          color: #475569;
          font-weight: 600;
        }
        .sf-input {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: inherit;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .sf-input:focus {
          border-color: #0f766e;
          box-shadow: 0 0 0 3px rgba(15,118,110,0.13);
        }
        textarea.sf-input { resize: vertical; min-height: 60px; }

        .sf-section-title {
          margin-top: 1.15rem;
          margin-bottom: 0.65rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .sf-error {
          background: #fef2f2;
          color: #b91c1c;
          padding: 0.7rem 0.85rem;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 0.82rem;
          border: 1px solid #fecaca;
        }

        .sf-actions {
          position: sticky;
          bottom: 0;
          display: flex;
          gap: 0.5rem;
          margin-top: 1.5rem;
          padding: 0.85rem 0;
          background: linear-gradient(to top, #ffffff 75%, rgba(255,255,255,0));
        }
        .sf-btn {
          flex: 1;
          padding: 0.7rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.08s, opacity 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          line-height: 1;
        }
        .sf-btn:active { transform: scale(0.985); }
        .sf-btn-cancel {
          background: #ffffff;
          color: #475569;
          border: 1px solid #cbd5e1;
        }
        .sf-btn-cancel:hover { background: #f8fafc; }
        .sf-btn-submit {
          background: #0f766e;
          color: #ffffff;
          border: none;
          flex: 1.5;
        }
        .sf-btn-submit:hover { background: #0d5f59; }
        .sf-btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (min-width: 560px) {
          .sf-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.85rem 1rem;
          }
          .sf-span-2 { grid-column: 1 / -1; }
        }

        @media (min-width: 640px) {
          .sf-backdrop {
            padding: 2rem 1rem;
            align-items: flex-start;
          }
          .sf-modal {
            min-height: auto;
            border-radius: 14px;
            padding: 1.75rem 1.75rem 1.5rem;
          }
          .sf-title { font-size: 1.25rem; }
          .sf-actions {
            position: static;
            background: none;
            padding: 0;
            margin-top: 1.5rem;
            justify-content: flex-end;
          }
          .sf-btn { flex: 0 0 auto; }
          .sf-btn-cancel { padding: 0.65rem 1.25rem; }
          .sf-btn-submit { padding: 0.65rem 1.5rem; }
        }
      `}</style>

      <div className="sf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sf-header">
          <div>
            <h3 className="sf-title">
              {isEdit ? "শিক্ষার্থীর তথ্য সম্পাদনা" : "নতুন শিক্ষার্থী যোগ"}
            </h3>
            <p className="sf-subtitle">
              {isEdit ? "তথ্য পরিবর্তন করে আপডেট করুন" : "নিচের তথ্যগুলো পূরণ করুন"}
            </p>
          </div>
          <button className="sf-close" onClick={() => onClose(false)} aria-label="বন্ধ">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="sf-grid">
            <div className="sf-field sf-span-2">
              <label>শিক্ষার্থীর নাম *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                className="sf-input"
                placeholder="পূর্ণ নাম"
              />
            </div>

            <div className="sf-field">
              <label>আইডি</label>
              <input
                type="text"
                value={form.student_id}
                onChange={(e) => update("student_id", e.target.value)}
                className="sf-input"
                placeholder="যেমন: STU-001"
              />
            </div>

            <div className="sf-field">
              <label>শ্রেণি *</label>
              <select
                value={form.class_name}
                onChange={(e) => update("class_name", e.target.value)}
                required
                className="sf-input"
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="sf-field">
              <label>শাখা</label>
              <input
                type="text"
                value={form.section}
                onChange={(e) => update("section", e.target.value)}
                className="sf-input"
                placeholder="যেমন: ক"
              />
            </div>

            <div className="sf-field">
              <label>রোল</label>
              <input
                type="text"
                value={form.roll}
                onChange={(e) => update("roll", e.target.value)}
                className="sf-input"
              />
            </div>

            <div className="sf-field sf-span-2">
              <label>ভর্তি তারিখ</label>
              <input
                type="date"
                value={form.admission_date}
                onChange={(e) => update("admission_date", e.target.value)}
                className="sf-input"
              />
            </div>
          </div>

          <div className="sf-section-title">অভিভাবকের তথ্য</div>
          <div className="sf-grid">
            <div className="sf-field">
              <label>অভিভাবকের নাম</label>
              <input
                type="text"
                value={form.guardian_name}
                onChange={(e) => update("guardian_name", e.target.value)}
                className="sf-input"
              />
            </div>

            <div className="sf-field">
              <label>মোবাইল নম্বর</label>
              <input
                type="tel"
                value={form.guardian_phone}
                onChange={(e) => update("guardian_phone", e.target.value)}
                className="sf-input"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div className="sf-field sf-span-2">
              <label>ঠিকানা</label>
              <textarea
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                rows={2}
                className="sf-input"
                placeholder="গ্রাম/শহর, উপজেলা, জেলা"
              />
            </div>
          </div>

          <div className="sf-section-title">বেতন ও স্ট্যাটাস</div>
          <div className="sf-grid">
            <div className="sf-field">
              <label>মাসিক বেতন (৳) *</label>
              <input
                type="number"
                value={form.monthly_fee}
                onChange={(e) => update("monthly_fee", e.target.value)}
                required
                min={0}
                className="sf-input"
              />
            </div>

            <div className="sf-field">
              <label>ছাড় (৳)</label>
              <input
                type="number"
                value={form.discount}
                onChange={(e) => update("discount", e.target.value)}
                min={0}
                className="sf-input"
              />
            </div>

            <div className="sf-field sf-span-2">
              <label>ছাড়ের কারণ</label>
              <input
                type="text"
                value={form.discount_reason}
                onChange={(e) => update("discount_reason", e.target.value)}
                className="sf-input"
                placeholder="যেমন: এতিম, মেধাবী..."
              />
            </div>

            <div className="sf-field sf-span-2">
              <label>স্ট্যাটাস</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="sf-input"
              >
                <option value="active">সক্রিয়</option>
                <option value="inactive">নিষ্ক্রিয়</option>
              </select>
            </div>
          </div>

          {error && <div className="sf-error">{error}</div>}

          <div className="sf-actions">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="sf-btn sf-btn-cancel"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="sf-btn sf-btn-submit"
            >
              {loading ? "সংরক্ষণ হচ্ছে..." : isEdit ? "আপডেট করুন" : "যোগ করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
