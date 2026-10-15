"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  key: string;
  title: string;
  description: string;
  link: string;
  color: string;
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readKeys, setReadKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // বাইরে ক্লিক করলে বন্ধ
  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: Event) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    // পরের tick-এ listener যোগ করি
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleOutside, true);
      document.addEventListener("touchstart", handleOutside, true);
      document.addEventListener("keydown", handleEsc);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutside, true);
      document.removeEventListener("touchstart", handleOutside, true);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
      const monthEnd = new Date(currentYear, currentMonth, 0)
        .toISOString()
        .split("T")[0];
      const today = now.toISOString().split("T")[0];

      const list: Notification[] = [];

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
          link: `/dashboard/fees-status?filter=unpaid&highlight=due&month=${currentMonth}&year=${currentYear}`,
          color: "#b91c1c",
          count: dueCount,
        });
      }

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
          link: `/dashboard/students?highlight=new&month=${currentMonth}&year=${currentYear}`,
          color: "#15803d",
        });
      }

      const { data: todayPayments } = await supabase
        .from("fee_payments")
        .select("amount")
        .eq("payment_date", today);

      const todayTotal = (todayPayments || []).reduce(
        (s, p) => s + Number(p.amount),
        0
      );
      if (todayTotal > 0) {
        list.push({
          key: `today-${today}`,
          title: `আজ ৳ ${toBangla(todayTotal)} বেতন আদায়`,
          description: `${toBangla(todayPayments!.length)}টি পেমেন্ট`,
          link: `/dashboard/fees-status?highlight=today&date=${today}`,
          color: "#0f766e",
        });
      }

      const { data: heldStaff } = await supabase
        .from("profiles")
        .select("id")
        .eq("is_held", true);

      if ((heldStaff || []).length > 0) {
        list.push({
          key: `held-${heldStaff!.length}`,
          title: `${toBangla(heldStaff!.length)} জন কর্মচারী Hold-এ`,
          description: "তারা লগইন করতে পারবে না",
          link: `/admin/users?highlight=held`,
          color: "#b45309",
        });
      }

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
          link: `/dashboard/students?highlight=discount`,
          color: "#7c3aed",
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

  function handleClick(n: Notification) {
    markAsRead(n.key);
    setOpen(false);
    router.push(n.link);
  }

  const unreadCount = notifications.filter((n) => !readKeys.has(n.key)).length;

  if (loading) return null;

  return (
    <>
      {/* Invisible backdrop — শুধু open থাকলে */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          onTouchStart={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "transparent",
            cursor: "default",
          }}
        />
      )}

      <div ref={containerRef} className="relative" style={{ zIndex: 9999 }}>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-slate-900">
              {toBangla(unreadCount)}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute top-[calc(100%+8px)] right-0 w-[340px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="font-semibold text-brand-600 dark:text-brand-400 text-sm">
                নোটিফিকেশন
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-brand-600 dark:text-brand-400 text-[11px] font-medium hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center text-slate-500 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = readKeys.has(n.key);
                  return (
                    <button
                      key={n.key}
                      onClick={() => handleClick(n)}
                      className={`block w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        isRead
                          ? "bg-white dark:bg-slate-900"
                          : "bg-emerald-50/50 dark:bg-emerald-900/10"
                      }`}
                      style={{
                        borderLeftWidth: "3px",
                        borderLeftStyle: "solid",
                        borderLeftColor: n.color,
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-[13px] mb-1 ${
                              isRead
                                ? "font-normal text-slate-700 dark:text-slate-300"
                                : "font-semibold text-slate-900 dark:text-white"
                            }`}
                          >
                            {n.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {n.description}
                          </div>
                        </div>
                        {!isRead && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                            style={{ background: n.color }}
                          />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
