"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  key: string;
  title: string;
  description: string;
  link: string;
  tone: "rose" | "emerald" | "teal" | "amber" | "violet";
  count?: number;
};

function toBangla(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

export default function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readKeys, setReadKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
      const monthEnd = new Date(currentYear, currentMonth, 0).toISOString().split("T")[0];
      const today = now.toISOString().split("T")[0];

      const list: Notification[] = [];

      /* ১. বকেয়া */
      const { data: students } = await supabase
        .from("students")
        .select("id, monthly_fee, discount")
        .eq("status", "active");

      const { data: payments } = await supabase
        .from("fee_payments")
        .select("student_id, amount")
        .eq("month", currentMonth)
        .eq("year", currentYear);

      const paidMap: Record<number, number> = {};
      (payments || []).forEach((p) => {
        paidMap[p.student_id] = (paidMap[p.student_id] || 0) + Number(p.amount);
      });

      let dueCount = 0;
      let dueAmount = 0;
      (students || []).forEach((s) => {
        const payable = Number(s.monthly_fee || 0) - Number(s.discount || 0);
        const paid = paidMap[s.id] || 0;
        if (paid < payable) {
          dueCount++;
          dueAmount += payable - paid;
        }
      });

      if (dueCount > 0) {
        list.push({
          key: `due-${currentYear}-${currentMonth}`,
          title: `${toBangla(dueCount)} জন শিক্ষার্থীর বেতন বাকি`,
          description: `মোট বাকি: ৳ ${toBangla(dueAmount)}`,
          link: "/dashboard/fees-status",
          tone: "rose",
          count: dueCount,
        });
      }

      /* ২. নতুন ভর্তি */
      const { data: newStudents } = await supabase
        .from("students")
        .select("id")
        .gte("admission_date", monthStart)
        .lte("admission_date", monthEnd);

      if ((newStudents || []).length > 0) {
        list.push({
          key: `new-${currentYear}-${currentMonth}`,
          title: `${toBangla(newStudents!.length)} জন নতুন শিক্ষার্থী ভর্তি`,
          description: "এই মাসে যোগ হয়েছে",
          link: "/dashboard/students",
          tone: "emerald",
        });
      }

      /* ৩. আজকের আদায় */
      const { data: todayPayments } = await supabase
        .from("fee_payments")
        .select("amount")
        .eq("payment_date", today);

      const todayTotal = (todayPayments || []).reduce((s, p) => s + Number(p.amount), 0);
      if (todayTotal > 0) {
        list.push({
          key: `today-${today}`,
          title: `আজ ৳ ${toBangla(todayTotal)} বেতন আদায়`,
          description: `${toBangla(todayPayments!.length)}টি পেমেন্ট`,
          link: "/dashboard/fees-status",
          tone: "teal",
        });
      }

      /* ৪. Hold কর্মচারী */
      const { data: heldStaff } = await supabase
        .from("profiles")
        .select("id")
        .eq("is_held", true);

      if ((heldStaff || []).length > 0) {
        list.push({
          key: `held-${heldStaff!.length}`,
          title: `${toBangla(heldStaff!.length)} জন কর্মচারী Hold-এ`,
          description: "তারা লগইন করতে পারবে না",
          link: "/admin/settings",
          tone: "amber",
        });
      }

      /* ৫. ছাড় */
      const { data: discountStudents } = await supabase
        .from("students")
        .select("id")
        .gt("discount", 0)
        .eq("status", "active");

      if ((discountStudents || []).length > 0) {
        list.push({
          key: `discount-${discountStudents!.length}`,
          title: `${toBangla(discountStudents!.length)} জন শিক্ষার্থী ছাড় পাচ্ছে`,
          description: "বেতনে ছাড় রয়েছে",
          link: "/dashboard/students",
          tone: "violet",
        });
      }

      setNotifications(list);

      const { data: reads } = await supabase
        .from("notification_reads")
        .select("notification_key")
        .eq("user_id", userId);

      const keys = new Set((reads || []).map((r) => r.notification_key));
      setReadKeys(keys);
      setLoading(false);
    }

    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  async function markAsRead(key: string) {
    const { error } = await supabase
      .from("notification_reads")
      .upsert({ user_id: userId, notification_key: key });

    if (!error) {
      setReadKeys((prev) => new Set([...prev, key]));
    }
  }

  async function markAllAsRead() {
    const toInsert = notifications
      .filter((n) => !readKeys.has(n.key))
      .map((n) => ({ user_id: userId, notification_key: n.key }));

    if (toInsert.length === 0) return;

    const { error } = await supabase
      .from("notification_reads")
      .upsert(toInsert);

    if (!error) {
      setReadKeys(new Set([...readKeys, ...notifications.map((n) => n.key)]));
    }
  }

  const unreadCount = notifications.filter((n) => !readKeys.has(n.key)).length;

  if (loading) {
    return (
      <div className="notif-loading" aria-hidden="true">
        <span className="notif-skeleton" />
      </div>
    );
  }

  /* tone → color mapping for JSX dots */
  const toneColor: Record<Notification["tone"], string> = {
    rose: "#e11d48",
    emerald: "#16a34a",
    teal: "#0f766e",
    amber: "#d97706",
    violet: "#7c3aed",
  };

  return (
    <div className="notif-root">
      {/* ---------- Trigger ---------- */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`নোটিফিকেশন${unreadCount > 0 ? ` (${unreadCount}টি অপঠিত)` : ""}`}
        aria-expanded={open}
        className="notif-btn"
      >
        <svg
          className="notif-btn-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {toBangla(unreadCount > 9 ? "9+" : unreadCount)}
          </span>
        )}
      </button>

      {/* ---------- Popover ---------- */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="notif-overlay"
            aria-hidden="true"
          />
          <div role="dialog" aria-label="নোটিফিকেশন" className="notif-panel">
            {/* Header */}
            <header className="notif-head">
              <div className="notif-head-left">
                <span className="notif-head-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </span>
                <div>
                  <h3 className="notif-head-title">নোটিফিকেশন</h3>
                  <p className="notif-head-sub">
                    {unreadCount > 0
                      ? `${toBangla(unreadCount)}টি অপঠিত`
                      : "সব পড়া হয়েছে"}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="notif-mark-all"
                >
                  সব পড়া হয়েছে
                </button>
              )}
            </header>

            {/* List */}
            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <div className="notif-empty-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </div>
                  <p className="notif-empty-title">কোনো নোটিফিকেশন নেই</p>
                  <p className="notif-empty-sub">সবকিছু ঠিক আছে ✨</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = readKeys.has(n.key);
                  return (
                    <Link
                      key={n.key}
                      href={n.link}
                      onClick={() => {
                        markAsRead(n.key);
                        setOpen(false);
                      }}
                      className={`notif-item ${isRead ? "notif-item-read" : "notif-item-unread"}`}
                    >
                      <span
                        className="notif-item-bar"
                        style={{ background: toneColor[n.tone] }}
                      />
                      <span
                        className="notif-item-dot"
                        style={{ background: toneColor[n.tone] }}
                      />
                      <div className="notif-item-body">
                        <p className="notif-item-title">{n.title}</p>
                        <p className="notif-item-desc">{n.description}</p>
                      </div>
                      {!isRead && (
                        <span
                          className="notif-item-unread-badge"
                          style={{ background: toneColor[n.tone] }}
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <footer className="notif-foot">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="notif-foot-link"
                >
                  ড্যাশবোর্ডে ফিরে যান
                </Link>
              </footer>
            )}
          </div>
        </>
      )}

      {/* ---------- Styles ---------- */}
      <style>{`
        .notif-root {
          position: relative;
        }

        /* ---------- Skeleton ---------- */
        .notif-loading {
          width: 36px;
          height: 36px;
        }
        .notif-skeleton {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #f1f5f9, #e2e8f0, #f1f5f9);
          background-size: 200% 100%;
          animation: notifPulse 1.4s infinite;
        }
        @keyframes notifPulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ---------- Trigger Button ---------- */
        .notif-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          cursor: pointer;
          transition:
            background-color 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease,
            box-shadow 0.15s ease,
            transform 0.1s ease;
          flex-shrink: 0;
        }
        .notif-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .notif-btn:active {
          transform: scale(0.96);
        }
        .notif-btn:focus-visible {
          outline: 2px solid #0f766e;
          outline-offset: 2px;
        }
        .notif-btn-icon {
          width: 17px;
          height: 17px;
        }

        /* ---------- Badge ---------- */
        .notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          background: linear-gradient(135deg, #dc2626, #f43f5e);
          color: #ffffff;
          font-size: 0.66rem;
          font-weight: 700;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 0 0 2px #ffffff,
            0 3px 8px -2px rgba(220, 38, 38, 0.55);
          animation: notifBounce 2s ease-in-out infinite;
          font-family: inherit;
        }
        @keyframes notifBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }

        /* ---------- Overlay ---------- */
        .notif-overlay {
          position: fixed;
          inset: 0;
          z-index: 40;
          background: transparent;
        }

        /* ---------- Panel ---------- */
        .notif-panel {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 360px;
          max-width: calc(100vw - 2rem);
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow:
            0 4px 6px -2px rgba(15, 23, 42, 0.04),
            0 20px 40px -16px rgba(15, 23, 42, 0.18);
          z-index: 50;
          overflow: hidden;
          animation: notifIn 0.18s cubic-bezier(0.2, 0.9, 0.3, 1.1);
        }
        @keyframes notifIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ---------- Head ---------- */
        .notif-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.9rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          background: linear-gradient(180deg, #ffffff, #fcfdfe);
        }
        .notif-head-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          min-width: 0;
        }
        .notif-head-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #ccfbf1, #99f6e4);
          color: #0f766e;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .notif-head-icon svg {
          width: 16px;
          height: 16px;
        }
        .notif-head-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
        }
        .notif-head-sub {
          font-size: 0.7rem;
          color: #94a3b8;
          margin: 0.15rem 0 0;
          line-height: 1.2;
        }
        .notif-mark-all {
          background: transparent;
          border: none;
          color: #0f766e;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.35rem 0.5rem;
          border-radius: 6px;
          font-family: inherit;
          transition: background 0.15s ease;
          flex-shrink: 0;
        }
        .notif-mark-all:hover {
          background: #f0fdfa;
        }

        /* ---------- List ---------- */
        .notif-list {
          max-height: 420px;
          overflow-y: auto;
          scrollbar-width: thin;
        }
        .notif-list::-webkit-scrollbar {
          width: 6px;
        }
        .notif-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 6px;
        }

        /* ---------- Item ---------- */
        .notif-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 0.7rem;
          padding: 0.8rem 1rem;
          text-decoration: none;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s ease;
        }
        .notif-item:last-child {
          border-bottom: none;
        }
        .notif-item:hover {
          background: #f8fafc;
        }
        .notif-item-unread {
          background: #f0fdfa;
        }
        .notif-item-unread:hover {
          background: #ecfdf5;
        }
        .notif-item-read {
          background: #ffffff;
          opacity: 0.85;
        }

        .notif-item-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          border-radius: 0 3px 3px 0;
        }

        .notif-item-dot {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          flex-shrink: 0;
          opacity: 0.15;
          margin-left: 0.1rem;
        }
        .notif-item-dot::after {
          content: "";
          display: block;
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: inherit;
          opacity: 6;
        }

        .notif-item-body {
          flex: 1;
          min-width: 0;
        }
        .notif-item-title {
          font-size: 0.83rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 0.2rem;
          line-height: 1.35;
        }
        .notif-item-read .notif-item-title {
          font-weight: 500;
          color: #475569;
        }
        .notif-item-desc {
          font-size: 0.73rem;
          color: #64748b;
          margin: 0;
          line-height: 1.3;
        }
        .notif-item-unread-badge {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 0.4rem;
          box-shadow: 0 0 0 2px #ffffff;
        }

        /* ---------- Empty ---------- */
        .notif-empty {
          padding: 2rem 1rem;
          text-align: center;
        }
        .notif-empty-icon {
          width: 44px;
          height: 44px;
          margin: 0 auto 0.6rem;
          border-radius: 50%;
          background: #f1f5f9;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notif-empty-icon svg {
          width: 20px;
          height: 20px;
        }
        .notif-empty-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          margin: 0 0 0.2rem;
        }
        .notif-empty-sub {
          font-size: 0.73rem;
          color: #94a3b8;
          margin: 0;
        }

        /* ---------- Foot ---------- */
        .notif-foot {
          padding: 0.6rem 1rem;
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
          text-align: center;
        }
        .notif-foot-link {
          font-size: 0.75rem;
          font-weight: 600;
          color: #0f766e;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .notif-foot-link:hover {
          color: #0d6b63;
          text-decoration: underline;
        }

        /* ---------- Mobile ---------- */
        @media (max-width: 480px) {
          .notif-panel {
            position: fixed;
            top: 68px;
            right: 0.75rem;
            left: 0.75rem;
            width: auto;
            max-width: none;
          }
        }

        /* ---------- Dark Mode ---------- */
        .dark .notif-skeleton {
          background: linear-gradient(90deg, #1e293b, #334155, #1e293b);
          background-size: 200% 100%;
        }

        .dark .notif-btn {
          background: #1e293b;
          border-color: #334155;
          color: #cbd5e1;
        }
        .dark .notif-btn:hover {
          background: #334155;
          color: #f1f5f9;
          border-color: #475569;
        }
        .dark .notif-badge {
          box-shadow:
            0 0 0 2px #0f172a,
            0 3px 8px -2px rgba(220, 38, 38, 0.55);
        }

        .dark .notif-panel {
          background: #0f172a;
          border-color: #1e293b;
          box-shadow:
            0 4px 6px -2px rgba(0, 0, 0, 0.4),
            0 20px 40px -16px rgba(0, 0, 0, 0.7);
        }
        .dark .notif-head {
          background: linear-gradient(180deg, #0f172a, #111f36);
          border-bottom-color: #1e293b;
        }
        .dark .notif-head-icon {
          background: linear-gradient(135deg, rgba(15, 118, 110, 0.35), rgba(20, 184, 166, 0.25));
          color: #5eead4;
        }
        .dark .notif-head-title { color: #f1f5f9; }
        .dark .notif-head-sub { color: #64748b; }
        .dark .notif-mark-all { color: #5eead4; }
        .dark .notif-mark-all:hover { background: rgba(15, 118, 110, 0.15); }

        .dark .notif-list::-webkit-scrollbar-thumb {
          background: #334155;
        }
        .dark .notif-item {
          border-bottom-color: #1e293b;
        }
        .dark .notif-item:hover { background: #111f36; }
        .dark .notif-item-unread { background: rgba(15, 118, 110, 0.12); }
        .dark .notif-item-unread:hover { background: rgba(15, 118, 110, 0.18); }
        .dark .notif-item-read { background: #0f172a; }

        .dark .notif-item-title { color: #f1f5f9; }
        .dark .notif-item-read .notif-item-title { color: #94a3b8; }
        .dark .notif-item-desc { color: #94a3b8; }
        .dark .notif-item-unread-badge {
          box-shadow: 0 0 0 2px #0f172a;
        }

        .dark .notif-empty-icon {
          background: #1e293b;
          color: #475569;
        }
        .dark .notif-empty-title { color: #cbd5e1; }
        .dark .notif-empty-sub { color: #64748b; }

        .dark .notif-foot {
          background: #111f36;
          border-top-color: #1e293b;
        }
        .dark .notif-foot-link { color: #5eead4; }
        .dark .notif-foot-link:hover { color: #99f6e4; }
      `}</style>
    </div>
  );
}
