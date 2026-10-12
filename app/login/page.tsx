"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", color: "#0f766e", textAlign: "center" }}>
          দারুল হিকমাহ মডেল মাদ্রাসা
        </h1>
        <p style={{ textAlign: "center", color: "#64748b", marginBottom: "2rem" }}>
          হিসাব ব্যবস্থাপনা সিস্টেমে লগইন
        </p>

        <form onSubmit={handleLogin} style={{ background: "#ffffff", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
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
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "1rem" }}
              placeholder="••••••••"
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
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#64748b" }}>
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/register" style={{ color: "#0f766e", fontWeight: "500" }}>
            নিবন্ধন করুন
          </Link>
        </p>
      </div>
    </main>
  );
}
