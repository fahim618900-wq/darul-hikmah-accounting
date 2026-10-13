"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type PublicStudent = {
  id: number;
  name: string;
  class_name: string;
  roll: string | null;
  section: string | null;
};

const CLASSES = [
  "প্লে", "নার্সারি", "প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম",
  "ষষ্ঠ", "সপ্তম", "অষ্টম", "নবম", "দশম", "নূরানী", "নাযেরা", "হিফয",
];

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
      // পোর্টাল চালু আছে কি না চেক
      const { data: setting } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "student_portal_enabled")
        .single();

      const enabled = setting?.value === "true";
      setPortalEnabled(enabled);

      // যদি আগে সিলেক্ট করা থাকে, সরাসরি view-তে যাই
      const savedIds = localStorage.getItem("student_portal_ids");
      if (enabled && savedIds) {
        const ids = JSON.parse(savedIds);
        if (Array.isArray(ids) && ids.length > 0) {
          window.location.href = "/student/view";
          return;
        }
      }

      // শিক্ষার্থী তালিকা লোড করি
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
  }

  function handleNext() {
    if (selected.length === 0) {
      setError("অন্তত একটি নাম সিলেক্ট করুন");
      return;
    }
    setError("");
    setStep("warning");
  }

  function handleConfirmWarning() {
    setStep("verify");
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
      setError("সমস্যা: " + err.message);
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
      <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "8px", textAlign: "center", color: "#64748b" }}>
        লোড হচ্ছে...
      </div>
    );
  }

    if (!portalEnabled) {
    return (
      <div style={{ background: "#ffffff", padding: "2.5rem 2rem", borderRadius: "10px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <h2 style={{ fontSize: "1.3rem", color: "#b91c1c", marginBottom: "0.75rem" }}>
          শিক্ষার্থী পোর্টাল বন্ধ
        </h2>

        <p style={{ color: "#475569", marginBottom: "0.5rem", lineHeight: 1.6 }}>
          শিক্ষার্থী পোর্টাল বর্তমানে বন্ধ রাখা হয়েছে।
        </p>

        <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6 }}>
          অনুগ্রহ করে মাদ্রাসার Admin-এর সাথে যোগাযোগ করুন।
        </p>

        <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "#94a3b8" }}>
          দারুল হিকমাহ মডেল মাদ্রাসা — শিক্ষার্থী পোর্টাল
        </p>
      </div>
    );
  }

  if (step === "select") {
    return (
      <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#0f766e" }}>
          আপনার পরিচয় নির্বাচন করুন
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
          প্রথমে শ্রেণি নির্বাচন করুন, তারপর নিজের নাম সিলেক্ট করুন। ভাই/বোন থাকলে তাদের নামও সিলেক্ট করতে পারবেন।
        </p>

        <label style={label}>শ্রেণি নির্বাচন করুন</label>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          style={input}
        >
          <option value="">-- শ্রেণি --</option>
          {CLASSES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {classFilter && (
          <div style={{ marginTop: "1rem" }}>
            {filteredStudents.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                এই শ্রেণিতে কোনো শিক্ষার্থী নেই
              </p>
            ) : (
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "6px", maxHeight: "300px", overflowY: "auto" }}>
                {filteredStudents.map((s) => {
                  const isSelected = selected.find((x) => x.id === s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSelect(s)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        background: isSelected ? "#f0fdf4" : "#ffffff",
                        border: "none",
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                        fontSize: "0.95rem",
                        color: "#1a1a1a",
                      }}
                    >
                      <span style={{ marginRight: "0.5rem" }}>{isSelected ? "☑" : "☐"}</span>
                      {s.name}
                      <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
                        (রোল: {s.roll || "-"})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selected.length > 0 && (
          <div style={{ marginTop: "1rem", background: "#f0fdf4", padding: "0.75rem", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: "0.85rem", color: "#15803d", marginBottom: "0.25rem" }}>
              নির্বাচিত:
            </div>
            <div style={{ fontSize: "0.9rem", color: "#15803d", fontWeight: "500" }}>
              {selected.map((s) => s.name).join(", ")}
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleNext}
          style={{ ...btnPrimary, marginTop: "1.25rem" }}
        >
          পরবর্তী ধাপ
        </button>
      </div>
    );
  }

  if (step === "warning") {
    return (
      <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "2px solid #fecaca" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⚠️</div>
          <h2 style={{ fontSize: "1.2rem", color: "#b91c1c", marginBottom: "0.5rem" }}>
            কঠোর সতর্কবার্তা
          </h2>
        </div>

        <div style={{ background: "#fef2f2", padding: "1rem", borderRadius: "6px", fontSize: "0.9rem", color: "#7f1d1d", lineHeight: 1.7, marginBottom: "1.25rem" }}>
          <p style={{ marginBottom: "0.75rem" }}>
            <strong>এই পোর্টালে শুধু নিজের এবং আপনার ভাই/বোনের তথ্য দেখার অনুমতি আছে।</strong>
          </p>
          <p style={{ marginBottom: "0.75rem" }}>
            অন্যের তথ্য দেখার চেষ্টা করলে:
          </p>
          <ul style={{ paddingRight: "1.25rem", paddingLeft: "1.25rem", marginBottom: "0.75rem" }}>
            <li>আপনার নিজের তথ্যও দেখা বন্ধ হয়ে যাবে</li>
            <li>আপনার অ্যাক্সেস স্থায়ীভাবে বন্ধ হয়ে যাবে</li>
            <li>মাদ্রাসা কর্তৃপক্ষ কোনো দায় নেবে না</li>
          </ul>
          <p>
            আপনি কি নিশ্চিত যে আপনি শুধু নিজের এবং ভাই/বোনের নাম সিলেক্ট করেছেন?
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => setStep("select")}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "#ffffff",
              color: "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "0.95rem",
            }}
          >
            না, ফিরে যান
          </button>
          <button
            onClick={handleConfirmWarning}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "#b91c1c",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: "500",
            }}
          >
            হ্যাঁ, নিশ্চিত
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#0f766e" }}>
        পরিচয় যাচাই
      </h2>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
        আপনার অভিভাবকের মোবাইল নম্বরের <strong>শেষ ৪ ডিজিট</strong> দিন।
      </p>

      <form onSubmit={handleVerify}>
        <label style={label}>শেষ ৪ ডিজিট</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={phoneLast4}
          onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="____"
          required
          style={{ ...input, fontSize: "1.5rem", letterSpacing: "0.5rem", textAlign: "center", fontWeight: "600" }}
        />

        {error && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || phoneLast4.length !== 4}
          style={{
            ...btnPrimary,
            marginTop: "1.25rem",
            opacity: loading || phoneLast4.length !== 4 ? 0.6 : 1,
            cursor: loading || phoneLast4.length !== 4 ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "যাচাই হচ্ছে..." : "যাচাই করুন"}
        </button>

        <button
          type="button"
          onClick={() => setStep("select")}
          style={{
            width: "100%",
            marginTop: "0.5rem",
            padding: "0.65rem",
            background: "#ffffff",
            color: "#475569",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "0.9rem",
          }}
        >
          ফিরে যান
        </button>
      </form>
    </div>
  );
}

const label: React.CSSProperties = {
  display: "block",
  marginBottom: "0.4rem",
  fontSize: "0.85rem",
  color: "#475569",
  fontWeight: "500",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "0.95rem",
  fontFamily: "inherit",
  background: "#ffffff",
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  background: "#0f766e",
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  fontSize: "0.95rem",
  fontWeight: "500",
  cursor: "pointer",
};
