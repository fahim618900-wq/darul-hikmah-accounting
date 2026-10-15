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
  const [showPassword, setShowPassword] = useState(false);

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

  /* ========== ১. লোডিং অবস্থা ========== */
  if (checking) {
    return (
      <main className="reg-main">
        <div className="reg-bg-pattern" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="islamic-pattern-reg"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M40 0 L80 40 L40 80 L0 40 Z M40 20 L60 40 L40 60 L20 40 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-pattern-reg)" />
          </svg>
        </div>
        <div className="reg-loading-box">
          <span className="reg-spinner" aria-hidden="true" />
          <p>লোড হচ্ছে...</p>
        </div>
      </main>
    );
  }

  /* ========== ২. নিবন্ধন বন্ধ অবস্থা ========== */ ..............*.*.
  if (!signupEnabled) {
    return (
      <main className="reg-main">
        <div className="reg-bg-pattern" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="islamic-pattern-reg-closed"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M40 0 L80 40 L40 80 L0 40 Z M40 20 L60 40 L40 60 L20 40 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#islamic-pattern-reg-closed)"
            />
          </svg>
        </div>

        <div className="reg-container">
          <div className="reg-status-card">
            <div className="reg-status-icon reg-status-icon-danger">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11 V 7 a 5 5 0 0 1 10 0 V 11" />
              </svg>
            </div>

            <h1 className="reg-status-title reg-status-title-danger">
              নতুন নিবন্ধন বন্ধ
            </h1>

            <p className="reg-status-text">
              বর্তমানে নতুন অ্যাকাউন্ট তৈরি বন্ধ রাখা হয়েছে।
            </p>

            <p className="reg-status-hint">
              যদি আপনার অ্যাকাউন্ট প্রয়োজন হয়, অনুগ্রহ করে মাদ্রাসার
              Admin-এর সাথে যোগাযোগ করুন।
            </p>

            <Link href="/login" className="reg-btn-primary reg-btn-inline">
              লগইন পেজে যান
            </Link>

            <p className="reg-status-footer">
              দারুল হিকমাহ মডেল মাদ্রাসা — হিসাব ব্যবস্থাপনা
            </p>
          </div>
        </div>

        <RegStyles />
      </main>
    );
  }

  /* ========== ৩. নিবন্ধন সফল অবস্থা ========== */
  if (success) {
    return (
      <main className="reg-main">
        <div className="reg-bg-pattern" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="islamic-pattern-reg-success"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M40 0 L80 40 L40 80 L0 40 Z M40 20 L60 40 L40 60 L20 40 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#islamic-pattern-reg-success)"
            />
          </svg>
        </div>

        <div className="reg-container">
          <div className="reg-status-card">
            <div className="reg-status-icon reg-status-icon-success">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 L 9 17 L 4 12" />
              </svg>
            </div>

            <h1 className="reg-status-title reg-status-title-success">
              নিবন্ধন সফল হয়েছে
            </h1>

            <p className="reg-status-text">
              আপনার ইমেইলে একটি যাচাইকরণ লিংক পাঠানো হয়েছে। লিংকে ক্লিক করে
              ইমেইল যাচাই করুন।
            </p>

            <div className="reg-steps">
              <div className="reg-step">
                <span className="reg-step-num">১</span>
                <span className="reg-step-text">
                  ইমেইলের যাচাইকরণ লিংকে ক্লিক করুন
                </span>
              </div>
              <div className="reg-step">
                <span className="reg-step-num">২</span>
                <span className="reg-step-text">
                  Admin আপনার অ্যাকাউন্ট অনুমোদন করবেন
                </span>
              </div>
              <div className="reg-step">
                <span className="reg-step-num">৩</span>
                <span className="reg-step-text">
                  এরপর আপনি সিস্টেমে লগইন করতে পারবেন
                </span>
              </div>
            </div>

            <Link href="/login" className="reg-btn-primary reg-btn-inline">
              লগইন পেজে যান
            </Link>
          </div>
        </div>

        <RegStyles />
      </main>
    );
  }

  /* ========== ৪. নিবন্ধন ফর্ম ========== */
  return (
    <main className="reg-main">
      <div className="reg-bg-pattern" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="islamic-pattern-reg-form"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M40 0 L80 40 L40 80 L0 40 Z M40 20 L60 40 L40 60 L20 40 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#islamic-pattern-reg-form)"
          />
        </svg>
      </div>

      <div className="reg-container">
        <div className="reg-header">
          <div className="reg-logo">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 L12 4" />
              <path d="M12 4 C 8 6, 6 9, 6 13 L 6 21 L 18 21 L 18 13 C 18 9, 16 6, 12 4 Z" />
              <path d="M10 21 L 10 17 C 10 15.5, 14 15.5, 14 17 L 14 21" />
              <path d="M3 21 L 21 21" />
            </svg>
          </div>
          <h1 className="reg-title">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="reg-subtitle">দারুল হিকমাহ মডেল মাদ্রাসা</p>
        </div>

        <form onSubmit={handleRegister} className="reg-card">
          {/* পূর্ণ নাম */}
          <div className="reg-field">
            <label htmlFor="fullName" className="reg-label">
              পূর্ণ নাম
            </label>
            <div className="reg-input-wrap">
              <span className="reg-input-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21 a 8 8 0 0 1 16 0" />
                </svg>
              </span>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="reg-input"
                placeholder="আপনার পূর্ণ নাম"
                autoComplete="name"
              />
            </div>
          </div>

          {/* ইমেইল */}
          <div className="reg-field">
            <label htmlFor="email" className="reg-label">
              ইমেইল
            </label>
            <div className="reg-input-wrap">
              <span className="reg-input-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7 L 12 13 L 21 7" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="reg-input"
                placeholder="apnar@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* পাসওয়ার্ড */}
          <div className="reg-field">
            <label htmlFor="password" className="reg-label">
              পাসওয়ার্ড
            </label>
            <div className="reg-input-wrap">
              <span className="reg-input-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10 V 7 a 4 4 0 0 1 8 0 V 10" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="reg-input reg-input-with-toggle"
                placeholder="কমপক্ষে ৬ অক্ষর"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="reg-toggle-password"
                aria-label={
                  showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"
                }
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12 s 4-7 10-7 10 7 10 7 -4 7 -10 7 -10 -7 -10 -7 Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94 A 10.94 10.94 0 0 1 12 20 c -6 0 -10 -8 -10 -8 a 18.45 18.45 0 0 1 5.06 -5.94" />
                    <path d="M9.9 4.24 A 10.94 10.94 0 0 1 12 4 c 6 0 10 8 10 8 a 18.5 18.5 0 0 1 -3.22 4.4" />
                    <path d="M14.12 14.12 a 3 3 0 1 1 -4.24 -4.24" />
                    <path d="M1 1 L 23 23" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="reg-error" role="alert">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="reg-error-icon"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8 v 4" />
                <path d="M12 16 h .01" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="reg-btn-primary">
            {loading ? (
              <>
                <span className="reg-spinner" aria-hidden="true" />
                নিবন্ধন হচ্ছে...
              </>
            ) : (
              "নিবন্ধন করুন"
            )}
          </button>
        </form>

        <p className="reg-footer-text">
          অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="reg-footer-link">
            লগইন করুন
          </Link>
        </p>
      </div>

      <footer className="reg-site-footer">
        © {new Date().getFullYear()} দারুল হিকমাহ মডেল মাদ্রাসা · সর্বস্বত্ব
        সংরক্ষিত
      </footer>

      <RegStyles />
    </main>
  );
}

/* ============================================
   Shared Styles Component (একই ডিজাইন ভাষা)
   ============================================ */
function RegStyles() {
  return (
    <style jsx global>{`
      /* ---------- Base ---------- */
      .reg-main {
        position: relative;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem 5rem;
        background: #f8fafc;
        color: #0f172a;
        font-family: "Hind Siliguri", "Noto Sans Bengali", system-ui,
          -apple-system, "Segoe UI", sans-serif;
        overflow: hidden;
      }

      .reg-bg-pattern {
        position: absolute;
        inset: 0;
        color: #0f766e;
        opacity: 0.045;
        pointer-events: none;
        z-index: 0;
      }

      .reg-bg-pattern svg {
        display: block;
        width: 100%;
        height: 100%;
      }

      .reg-container {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 420px;
        margin: 0 auto;
      }

      /* ---------- Loading ---------- */
      .reg-loading-box {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.85rem;
        color: #64748b;
        font-size: 0.95rem;
      }

      /* ---------- Header (logo + title) ---------- */
      .reg-header {
        text-align: center;
        margin-bottom: 1.75rem;
      }

      .reg-logo {
        width: 64px;
        height: 64px;
        margin: 0 auto 1rem;
        border-radius: 18px;
        background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 20px -8px rgba(15, 118, 110, 0.5);
      }

      .reg-logo svg {
        width: 34px;
        height: 34px;
      }

      .reg-title {
        font-size: 1.5rem;
        line-height: 1.3;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 0.35rem;
        letter-spacing: -0.01em;
      }

      .reg-subtitle {
        font-size: 0.9rem;
        color: #64748b;
        margin: 0;
      }

      /* ---------- Card ---------- */
      .reg-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 1.75rem;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04),
          0 8px 24px -12px rgba(15, 23, 42, 0.08);
      }

      /* ---------- Field ---------- */
      .reg-field {
        margin-bottom: 1.1rem;
      }

      .reg-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: #334155;
        margin-bottom: 0.45rem;
      }

      .reg-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .reg-input-icon {
        position: absolute;
        left: 0.85rem;
        top: 50%;
        transform: translateY(-50%);
        color: #94a3b8;
        display: flex;
        pointer-events: none;
        transition: color 0.15s ease;
      }

      .reg-input-icon svg {
        width: 18px;
        height: 18px;
      }

      .reg-input {
        width: 100%;
        padding: 0.7rem 0.9rem 0.7rem 2.65rem;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        font-size: 0.95rem;
        color: #0f172a;
        background: #ffffff;
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease,
          background-color 0.15s ease;
        font-family: inherit;
      }

      .reg-input-with-toggle {
        padding-right: 2.75rem;
      }

      .reg-input::placeholder {
        color: #94a3b8;
      }

      .reg-input:hover {
        border-color: #94a3b8;
      }

      .reg-input:focus {
        border-color: #0f766e;
        box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.14);
      }

      .reg-input-wrap:focus-within .reg-input-icon {
        color: #0f766e;
      }

      /* Password toggle */
      .reg-toggle-password {
        position: absolute;
        right: 0.55rem;
        top: 50%;
        transform: translateY(-50%);
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 8px;
        color: #64748b;
        cursor: pointer;
        transition: color 0.15s ease, background-color 0.15s ease;
      }

      .reg-toggle-password:hover {
        color: #0f766e;
        background: #f1f5f9;
      }

      .reg-toggle-password svg {
        width: 18px;
        height: 18px;
      }

      /* ---------- Error ---------- */
      .reg-error {
        display: flex;
        align-items: flex-start;
        gap: 0.55rem;
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
        padding: 0.7rem 0.85rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        font-size: 0.85rem;
        line-height: 1.5;
        animation: regShake 0.35s ease;
      }

      .reg-error-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      @keyframes regShake {
        0%,
        100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-4px);
        }
        75% {
          transform: translateX(4px);
        }
      }

      /* ---------- Primary Button ---------- */
      .reg-btn-primary {
        width: 100%;
        padding: 0.75rem 1rem;
        background: #0f766e;
        color: #ffffff;
        border: none;
        border-radius: 10px;
        font-size: 0.95rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.55rem;
        transition: background-color 0.15s ease, transform 0.05s ease,
          box-shadow 0.15s ease;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
        margin-top: 0.35rem;
        text-decoration: none;
      }

      .reg-btn-primary:hover:not(:disabled) {
        background: #0d6b63;
        box-shadow: 0 6px 16px -8px rgba(15, 118, 110, 0.6);
      }

      .reg-btn-primary:active:not(:disabled) {
        transform: translateY(1px);
      }

      .reg-btn-primary:focus-visible {
        outline: 2px solid #0f766e;
        outline-offset: 2px;
      }

      .reg-btn-primary:disabled {
        cursor: not-allowed;
        opacity: 0.75;
      }

      .reg-btn-inline {
        display: inline-flex;
        width: auto;
        padding: 0.65rem 1.5rem;
        margin-top: 1.5rem;
      }

      /* ---------- Spinner ---------- */
      .reg-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: regSpin 0.7s linear infinite;
        display: inline-block;
      }

      .reg-loading-box .reg-spinner {
        border-color: rgba(15, 118, 110, 0.2);
        border-top-color: #0f766e;
        width: 24px;
        height: 24px;
        border-width: 2.5px;
      }

      @keyframes regSpin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ---------- Footer text ---------- */
      .reg-footer-text {
        text-align: center;
        margin: 1.35rem 0 0;
        font-size: 0.875rem;
        color: #64748b;
      }

      .reg-footer-link {
        color: #0f766e;
        font-weight: 600;
        text-decoration: none;
        transition: color 0.15s ease;
      }

      .reg-footer-link:hover {
        color: #0d6b63;
        text-decoration: underline;
      }

      .reg-site-footer {
        position: absolute;
        bottom: 1rem;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 0.75rem;
        color: #94a3b8;
        padding: 0 1rem;
      }

      /* ---------- Status Card (closed / success) ---------- */
      .reg-status-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 2.15rem 1.75rem;
        text-align: center;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04),
          0 8px 24px -12px rgba(15, 23, 42, 0.08);
      }

      .reg-status-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.25rem;
      }

      .reg-status-icon svg {
        width: 30px;
        height: 30px;
      }

      .reg-status-icon-danger {
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
      }

      .reg-status-icon-success {
        background: #ecfdf5;
        color: #0f766e;
        border: 1px solid #a7f3d0;
      }

      .reg-status-title {
        font-size: 1.35rem;
        font-weight: 700;
        margin: 0 0 0.7rem;
        line-height: 1.35;
      }

      .reg-status-title-danger {
        color: #b91c1c;
      }

      .reg-status-title-success {
        color: #0f766e;
      }

      .reg-status-text {
        color: #475569;
        margin: 0 0 0.65rem;
        line-height: 1.65;
        font-size: 0.95rem;
      }

      .reg-status-hint {
        color: #64748b;
        font-size: 0.875rem;
        margin: 0;
        line-height: 1.65;
      }

      .reg-status-footer {
        margin-top: 1.5rem;
        font-size: 0.8rem;
        color: #94a3b8;
      }

      /* ---------- Steps (success) ---------- */
      .reg-steps {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        margin-top: 1.5rem;
        text-align: left;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 1rem;
      }

      .reg-step {
        display: flex;
        align-items: flex-start;
        gap: 0.65rem;
      }

      .reg-step-num {
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #0f766e;
        color: #ffffff;
        font-size: 0.75rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 1px;
      }

      .reg-step-text {
        font-size: 0.875rem;
        color: #334155;
        line-height: 1.55;
      }

      /* =========================================
         Mobile vs Desktop
         ========================================= */
      @media (max-width: 640px) {
        .reg-main {
          padding: 1.5rem 1rem 4.5rem;
          align-items: stretch;
        }

        .reg-container {
          max-width: 100%;
        }

        .reg-header {
          margin-bottom: 1.25rem;
        }

        .reg-logo {
          width: 56px;
          height: 56px;
          border-radius: 16px;
        }

        .reg-logo svg {
          width: 28px;
          height: 28px;
        }

        .reg-title {
          font-size: 1.25rem;
        }

        .reg-subtitle {
          font-size: 0.8rem;
        }

        .reg-card {
          padding: 1.25rem;
          border-radius: 12px;
          box-shadow: 0 4px 16px -8px rgba(15, 23, 42, 0.12);
        }

        .reg-status-card {
          padding: 1.75rem 1.25rem;
          border-radius: 12px;
        }

        .reg-status-title {
          font-size: 1.2rem;
        }

        .reg-input {
          font-size: 16px; /* iOS zoom এড়াতে */
          padding-top: 0.65rem;
          padding-bottom: 0.65rem;
        }

        .reg-btn-primary {
          padding: 0.8rem 1rem;
          font-size: 1rem;
        }

        .reg-site-footer {
          font-size: 0.7rem;
        }
      }

      @media (min-width: 1024px) {
        .reg-main {
          padding: 3rem 2rem 5rem;
        }

        .reg-container {
          max-width: 440px;
        }

        .reg-header {
          margin-bottom: 2rem;
        }

        .reg-logo {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          margin-bottom: 1.15rem;
        }

        .reg-logo svg {
          width: 38px;
          height: 38px;
        }

        .reg-title {
          font-size: 1.65rem;
        }

        .reg-subtitle {
          font-size: 0.95rem;
        }

        .reg-card {
          padding: 2.15rem;
          border-radius: 16px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04),
            0 20px 40px -24px rgba(15, 23, 42, 0.12);
        }

        .reg-status-card {
          padding: 2.5rem 2.25rem;
          border-radius: 16px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04),
            0 20px 40px -24px rgba(15, 23, 42, 0.12);
        }
      }
    `}</style>
  );
}
