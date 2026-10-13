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
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="login-main">
      {/* হালকা ইসলামিক জ্যামিতিক প্যাটার্ন (ব্যাকগ্রাউন্ড) */}
      <div className="login-bg-pattern" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="islamic-pattern"
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
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
      </div>

      <div className="login-container">
        {/* মাদ্রাসার পরিচিতি + লোগো */}
        <div className="login-header">
          <div className="login-logo">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* মসজিদ / dome icon */}
              <path d="M12 2 L12 4" />
              <path d="M12 4 C 8 6, 6 9, 6 13 L 6 21 L 18 21 L 18 13 C 18 9, 16 6, 12 4 Z" />
              <path d="M10 21 L 10 17 C 10 15.5, 14 15.5, 14 17 L 14 21" />
              <path d="M3 21 L 21 21" />
            </svg>
          </div>
          <h1 className="login-title">দারুল হিকমাহ মডেল মাদ্রাসা</h1>
          <p className="login-subtitle">হিসাব ব্যবস্থাপনা সিস্টেম</p>
        </div>

        {/* লগইন কার্ড */}
        <form onSubmit={handleLogin} className="login-card">
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              ইমেইল
            </label>
            <div className="login-input-wrap">
              <span className="login-input-icon" aria-hidden="true">
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
                className="login-input"
                placeholder="apnar@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">
              পাসওয়ার্ড
            </label>
            <div className="login-input-wrap">
              <span className="login-input-icon" aria-hidden="true">
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
                className="login-input login-input-with-toggle"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="login-toggle-password"
                aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
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
            <div className="login-error" role="alert">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="login-error-icon"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8 v 4" />
                <path d="M12 16 h .01" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="login-submit">
            {loading ? (
              <>
                <span className="login-spinner" aria-hidden="true" />
                লগইন হচ্ছে...
              </>
            ) : (
              "লগইন করুন"
            )}
          </button>
        </form>

        {/* নিবন্ধন লিংক */}
        <p className="login-footer-text">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/register" className="login-footer-link">
            নিবন্ধন করুন
          </Link>
        </p>
      </div>

      {/* ফুটার */}
      <footer className="login-site-footer">
        © {new Date().getFullYear()} দারুল হিকমাহ মডেল মাদ্রাসা · সর্বস্বত্ব সংরক্ষিত
      </footer>

      {/* ===================== স্টাইল ===================== */}
      <style jsx global>{`
        /* ---------- Base / Container ---------- */
        .login-main {
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

        /* Background islamic pattern (very subtle) */
        .login-bg-pattern {
          position: absolute;
          inset: 0;
          color: #0f766e;
          opacity: 0.045;
          pointer-events: none;
          z-index: 0;
        }

        .login-bg-pattern svg {
          display: block;
          width: 100%;
          height: 100%;
        }

        /* ---------- Container ---------- */
        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }

        /* ---------- Header (logo + title) ---------- */
        .login-header {
          text-align: center;
          margin-bottom: 1.75rem;
        }

        .login-logo {
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

        .login-logo svg {
          width: 34px;
          height: 34px;
        }

        .login-title {
          font-size: 1.5rem;
          line-height: 1.3;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.35rem;
          letter-spacing: -0.01em;
        }

        .login-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
        }

        /* ---------- Card ---------- */
        .login-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.75rem;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04),
            0 8px 24px -12px rgba(15, 23, 42, 0.08);
        }

        /* ---------- Field ---------- */
        .login-field {
          margin-bottom: 1.1rem;
        }

        .login-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.45rem;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          display: flex;
          pointer-events: none;
          transition: color 0.15s ease;
        }

        .login-input-icon svg {
          width: 18px;
          height: 18px;
        }

        .login-input {
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

        .login-input-with-toggle {
          padding-right: 2.75rem;
        }

        .login-input::placeholder {
          color: #94a3b8;
        }

        .login-input:hover {
          border-color: #94a3b8;
        }

        .login-input:focus {
          border-color: #0f766e;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.14);
        }

        /* icon goes emerald on focus */
        .login-input-wrap:focus-within .login-input-icon {
          color: #0f766e;
        }

        /* Password toggle button */
        .login-toggle-password {
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

        .login-toggle-password:hover {
          color: #0f766e;
          background: #f1f5f9;
        }

        .login-toggle-password svg {
          width: 18px;
          height: 18px;
        }

        /* ---------- Error ---------- */
        .login-error {
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
          animation: loginShake 0.35s ease;
        }

        .login-error-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        @keyframes loginShake {
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

        /* ---------- Submit ---------- */
        .login-submit {
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
        }

        .login-submit:hover:not(:disabled) {
          background: #0d6b63;
          box-shadow: 0 6px 16px -8px rgba(15, 118, 110, 0.6);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(1px);
        }

        .login-submit:focus-visible {
          outline: 2px solid #0f766e;
          outline-offset: 2px;
        }

        .login-submit:disabled {
          cursor: not-allowed;
          opacity: 0.75;
        }

        /* Spinner */
        .login-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: loginSpin 0.7s linear infinite;
        }

        @keyframes loginSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ---------- Footer text ---------- */
        .login-footer-text {
          text-align: center;
          margin: 1.35rem 0 0;
          font-size: 0.875rem;
          color: #64748b;
        }

        .login-footer-link {
          color: #0f766e;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .login-footer-link:hover {
          color: #0d6b63;
          text-decoration: underline;
        }

        /* ---------- Site footer ---------- */
        .login-site-footer {
          position: absolute;
          bottom: 1rem;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 0.75rem;
          color: #94a3b8;
          padding: 0 1rem;
        }

        /* =========================================
           মোবাইল vs ডেস্কটপ আলাদা ডিজাইন
           ========================================= */
        @media (max-width: 640px) {
          .login-main {
            padding: 1.5rem 1rem 4.5rem;
            align-items: stretch;
          }

          .login-container {
            max-width: 100%;
          }

          .login-header {
            margin-bottom: 1.25rem;
          }

          .login-logo {
            width: 56px;
            height: 56px;
            border-radius: 16px;
          }

          .login-logo svg {
            width: 28px;
            height: 28px;
          }

          .login-title {
            font-size: 1.25rem;
          }

          .login-subtitle {
            font-size: 0.8rem;
          }

          .login-card {
            padding: 1.25rem;
            border-radius: 12px;
            /* মোবাইলে হালকা বেশি shadow — floating feel */
            box-shadow: 0 4px 16px -8px rgba(15, 23, 42, 0.12);
          }

          .login-input {
            font-size: 16px; /* iOS zoom এড়াতে */
            padding-top: 0.65rem;
            padding-bottom: 0.65rem;
          }

          .login-submit {
            padding: 0.8rem 1rem;
            font-size: 1rem;
          }

          .login-site-footer {
            font-size: 0.7rem;
          }
        }

        /* Desktop — আরও whitespace ও গভীর card */
        @media (min-width: 1024px) {
          .login-main {
            padding: 3rem 2rem 5rem;
          }

          .login-container {
            max-width: 440px;
          }

          .login-header {
            margin-bottom: 2rem;
          }

          .login-logo {
            width: 72px;
            height: 72px;
            border-radius: 20px;
            margin-bottom: 1.15rem;
          }

          .login-logo svg {
            width: 38px;
            height: 38px;
          }

          .login-title {
            font-size: 1.65rem;
          }

          .login-subtitle {
            font-size: 0.95rem;
          }

          .login-card {
            padding: 2.15rem;
            border-radius: 16px;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04),
              0 20px 40px -24px rgba(15, 23, 42, 0.12);
          }
        }

        /* ---------- Dark mode (ঐচ্ছিক) ---------- */
        @media (prefers-color-scheme: dark) {
          /* এই ব্লকটি বর্তমানে নিষ্ক্রিয় — theme-toggle এর সাথে
             সমন্বয় করে পরে ডার্ক মোড যোগ করা যাবে। */
        }
      `}</style>
    </main>
  );
}
