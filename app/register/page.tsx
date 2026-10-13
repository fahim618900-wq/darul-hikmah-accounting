"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [signupEnabled, setSignupEnabled] = useState(true);

  useEffect(() => {
    async function checkSignup() {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "signup_enabled")
        .single();

      setSignupEnabled(data?.value === "true");
      setChecking(false);
    }
    checkSignup();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (checking) {
    return (
      <main className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem", textAlign: "center", color: "#64748b" }}>
        লোড হচ্ছে...
      </main>
    );
  }

  if (!signupEnabled) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
        <div style={{ maxWidth: "500px", width: "100%", background: "#ffffff", padding: "2.5rem 2rem", borderRadius: "10px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 style={{ fontSize: "1.4rem", color: "#b91c1c", marginBottom: "0.75rem" }}>
            নতুন নিবন্ধন বন্ধ
          </h1>

          <p style={{ color: "#475569", marginBottom: "0.5rem", lineHeight: 1.6 }}>
            বর্তমানে নতুন অ্যাকাউন্ট তৈরি বন্ধ রাখা হয়েছে।
          </p>

          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.75rem", lineHeight: 1.6 }}>
            যদি আপনার অ্যাকাউন্ট প্রয়োজন হয়, অনুগ্রহ করে মাদ্রাসার Admin-এর সাথে যোগাযোগ করুন।
          </p>

          <Link
            href="/login"
            style={{
              display: "inline-block",
              padding: "0.65rem 1.5rem",
              background: "#0f766e",
              color: "#ffffff",
              borderRadius: "6px",
              fontWeight: "500",
              fontSize: "0.95rem",
              textDecoration: "none",
            }}
          >
            লগইন পেজে যান
          </Link>

          <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "#94a3b8" }}>
            দারুল হিকমাহ মডেল মাদ্রাসা — হিসাব ব্যবস্থাপনা
          </p>
        </div>
      </main>
    );
  }
  if (success) {
    return (
      <main className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", background: "#ffffff", padding: "2rem", borderRadius: "8px", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "1rem" }}>
            নিবন্ধন সফল হয়েছে
          </h1>
          <p style={{ color: "#475569", marginBottom: "1rem" }}>
            আপনার ইমেইলে একটি যাচাইকরণ লিংক পাঠানো হয়েছে। লিংকে ক্লিক করে ইমেইল যাচাই করুন।
          </p>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            ইমেইল যাচাইয়ের পর Admin অনুমোদন দিলে আপনি লগইন করতে পারবেন।
          </p>
          <Link href="/login" style={{ display: "inline-block", marginTop: "1.5rem", color: "#0f766e", fontWeight: "500" }}>
            লগইন পেজে যান
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", color: "#0f766e", textAlign: "center" }}>
          নিবন্ধন করুন
        </h1>
        <p style={{ textAlign: "center", color: "#64748b", marginBottom: "2rem" }}>
          দারুল হিকমাহ মডেল মাদ্রাসা
        </p>

        <form onSubmit={handleRegister} style={{ background: "#ffffff", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="fullName" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              পূর্ণ নাম
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "1rem" }}
              placeholder="আপনার পূর্ণ নাম"
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              ইমেইল
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "1rem" }}
              placeholder="apnar@email.com"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "1rem" }}
              placeholder="কমপক্ষে ৬ অক্ষর"
            />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "0.75rem", background: "#0f766e", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "500", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "নিবন্ধন হচ্ছে..." : "নিবন্ধন করুন"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#64748b" }}>
          অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" style={{ color: "#0f766e", fontWeight: "500" }}>
            লগইন করুন
          </Link>
        </p>
      </div>
    </main>
  );
}
