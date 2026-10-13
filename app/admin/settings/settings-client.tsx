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
    // আগে try update
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
      setMessage("সেটিংস সংরক্ষিত হয়েছে");
      router.refresh();
    } catch (e: any) {
      setError("সমস্যা: " + (e?.message || "অজানা ত্রুটি"));
    }

    setLoading(false);
  }

  return (
    <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", maxWidth: "600px" }}>
      <div style={{ marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>নতুন অ্যাকাউন্ট খোলা চালু</div>
            <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
              বন্ধ থাকলে কেউ নতুন অ্যাকাউন্ট খুলতে পারবে না
            </div>
          </div>
          <button
            onClick={() => setSignupEnabled(!signupEnabled)}
            style={{
              width: "50px",
              height: "26px",
              borderRadius: "13px",
              border: "none",
              background: signupEnabled ? "#0f766e" : "#cbd5e1",
              position: "relative",
              cursor: "pointer",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "3px",
                left: signupEnabled ? "27px" : "3px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#ffffff",
                transition: "left 0.2s",
              }}
            />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>শিক্ষার্থী পোর্টাল চালু</div>
            <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
              বন্ধ থাকলে শিক্ষার্থীরা পোর্টালে ঢুকতে পারবে না
            </div>
          </div>
          <button
            onClick={() => setPortalEnabled(!portalEnabled)}
            style={{
              width: "50px",
              height: "26px",
              borderRadius: "13px",
              border: "none",
              background: portalEnabled ? "#0f766e" : "#cbd5e1",
              position: "relative",
              cursor: "pointer",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "3px",
                left: portalEnabled ? "27px" : "3px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#ffffff",
                transition: "left 0.2s",
              }}
            />
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          padding: "0.65rem 1.5rem",
          background: "#0f766e",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "0.9rem",
          fontWeight: "500",
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "সংরক্ষণ..." : "সংরক্ষণ করুন"}
      </button>

      {message && (
        <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#dcfce7", color: "#15803d", borderRadius: "6px", fontSize: "0.85rem" }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}
    </div>
  );
}
