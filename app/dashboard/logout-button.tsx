"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  variant?: "icon" | "full";
};

export default function LogoutButton({ variant = "icon" }: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  /* ---------- Full variant (mobile menu / settings page) ---------- */
  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="logout-full"
      >
        <svg
          className="logout-full-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>{loading ? "লগআউট হচ্ছে..." : "লগআউট"}</span>
      </button>
    );
  }

  /* ---------- Icon variant (header) ---------- */
  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        aria-label="লগআউট"
        title="লগআউট"
        className="logout-icon"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="logout-overlay" onClick={() => !loading && setShowConfirm(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="logout-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="logout-modal-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>

            <h3 id="logout-title" className="logout-modal-title">
              লগআউট করতে চান?
            </h3>
            <p className="logout-modal-text">
              আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান? আবার লগইন না করা পর্যন্ত সিস্টেমে প্রবেশ করতে পারবেন না।
            </p>

            <div className="logout-modal-actions">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="logout-cancel"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="logout-confirm"
              >
                {loading ? (
                  <>
                    <span className="logout-spinner" aria-hidden="true" />
                    লগআউট হচ্ছে...
                  </>
                ) : (
                  "হ্যাঁ, লগআউট"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* =========================================
           Icon variant (header)
           ========================================= */
        .logout-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          cursor: pointer;
          transition:
            background-color 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease,
            transform 0.1s ease,
            box-shadow 0.15s ease;
          flex-shrink: 0;
        }
        .logout-icon:hover {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fca5a5;
          box-shadow: 0 4px 12px -6px rgba(185, 28, 28, 0.35);
        }
        .logout-icon:active {
          transform: scale(0.94);
        }
        .logout-icon:focus-visible {
          outline: 2px solid #b91c1c;
          outline-offset: 2px;
        }
        .logout-icon svg {
          width: 17px;
          height: 17px;
        }

        /* =========================================
           Full variant
           ========================================= */
        .logout-full {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.7rem 1rem;
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition:
            background-color 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease;
        }
        .logout-full:hover:not(:disabled) {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fca5a5;
        }
        .logout-full:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .logout-full-icon {
          width: 16px;
          height: 16px;
        }

        /* =========================================
           Confirmation Modal
           ========================================= */
        .logout-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: logoutOverlayIn 0.18s ease;
        }
        @keyframes logoutOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .logout-modal {
          position: relative;
          width: 100%;
          max-width: 380px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 1.75rem 1.5rem 1.35rem;
          text-align: center;
          box-shadow:
            0 4px 6px -2px rgba(15, 23, 42, 0.04),
            0 24px 48px -20px rgba(15, 23, 42, 0.35);
          animation: logoutModalIn 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.1);
        }
        @keyframes logoutModalIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .logout-modal-icon {
          width: 54px;
          height: 54px;
          margin: 0 auto 1rem;
          border-radius: 50%;
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logout-modal-icon svg {
          width: 26px;
          height: 26px;
        }

        .logout-modal-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.5rem;
          letter-spacing: -0.01em;
        }

        .logout-modal-text {
          font-size: 0.85rem;
          line-height: 1.6;
          color: #64748b;
          margin: 0 0 1.35rem;
        }

        .logout-modal-actions {
          display: flex;
          gap: 0.6rem;
        }

        .logout-cancel,
        .logout-confirm {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.7rem 1rem;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition:
            background-color 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease,
            transform 0.05s ease,
            box-shadow 0.15s ease;
        }

        .logout-cancel {
          background: #ffffff;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .logout-cancel:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .logout-confirm {
          background: #b91c1c;
          color: #ffffff;
          border: 1px solid #b91c1c;
          box-shadow: 0 4px 12px -6px rgba(185, 28, 28, 0.5);
        }
        .logout-confirm:hover:not(:disabled) {
          background: #991b1b;
          border-color: #991b1b;
          box-shadow: 0 6px 18px -8px rgba(185, 28, 28, 0.65);
        }
        .logout-confirm:active:not(:disabled) {
          transform: translateY(1px);
        }
        .logout-cancel:disabled,
        .logout-confirm:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .logout-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: logoutSpin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes logoutSpin {
          to { transform: rotate(360deg); }
        }

        /* =========================================
           Mobile
           ========================================= */
        @media (max-width: 480px) {
          .logout-modal {
            max-width: 100%;
            padding: 1.5rem 1.25rem 1.15rem;
          }
          .logout-modal-icon {
            width: 48px;
            height: 48px;
          }
          .logout-modal-icon svg {
            width: 22px;
            height: 22px;
          }
          .logout-modal-title { font-size: 1rem; }
          .logout-modal-text { font-size: 0.82rem; }
        }

        /* =========================================
           Dark Mode
           ========================================= */
        .dark .logout-icon {
          background: rgba(185, 28, 28, 0.15);
          color: #fca5a5;
          border-color: rgba(185, 28, 28, 0.3);
        }
        .dark .logout-icon:hover {
          background: rgba(185, 28, 28, 0.25);
          color: #fecaca;
          border-color: rgba(185, 28, 28, 0.5);
          box-shadow: 0 4px 12px -6px rgba(185, 28, 28, 0.55);
        }
        .dark .logout-icon:focus-visible {
          outline-color: #fca5a5;
        }

        .dark .logout-full {
          background: rgba(185, 28, 28, 0.15);
          color: #fca5a5;
          border-color: rgba(185, 28, 28, 0.3);
        }
        .dark .logout-full:hover:not(:disabled) {
          background: rgba(185, 28, 28, 0.25);
          color: #fecaca;
          border-color: rgba(185, 28, 28, 0.5);
        }

        .dark .logout-overlay {
          background: rgba(0, 0, 0, 0.6);
        }

        .dark .logout-modal {
          background: #0f172a;
          border-color: #1e293b;
          box-shadow:
            0 4px 6px -2px rgba(0, 0, 0, 0.4),
            0 24px 48px -20px rgba(0, 0, 0, 0.7);
        }
        .dark .logout-modal-icon {
          background: rgba(185, 28, 28, 0.18);
          color: #fca5a5;
          border-color: rgba(185, 28, 28, 0.35);
        }
        .dark .logout-modal-title { color: #f1f5f9; }
        .dark .logout-modal-text { color: #94a3b8; }

        .dark .logout-cancel {
          background: #1e293b;
          color: #cbd5e1;
          border-color: #334155;
        }
        .dark .logout-cancel:hover:not(:disabled) {
          background: #334155;
          color: #f1f5f9;
          border-color: #475569;
        }

        .dark .logout-confirm {
          background: #dc2626;
          border-color: #dc2626;
        }
        .dark .logout-confirm:hover:not(:disabled) {
          background: #b91c1c;
          border-color: #b91c1c;
        }
      `}</style>
    </>
  );
}
