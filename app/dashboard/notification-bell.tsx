"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    async function load() {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
      const monthEnd = new Date(currentYear, currentMonth, 0).toISOString().split("T")[0];
      const today = now.toISOString().split("T")[0];

      const list: Notification[] = [];

      // ১. এই মাসে কতজন বাকি
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

      // ২. নতুন ভর্তি (এই মাসে)
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

      // ৩. আজকের আদায়
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
          link: `/dashboard/fees-status?highlight=today&date=${today}`,
          color: "#0f766e",
        });
      }

      // ৪. Hold করা কর্মচারী
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

      // ৫. ছাড় পাওয়া শিক্ষার্থী
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

      // পড়া হয়েছে কিনা চেক করি
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
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: "8px",
          padding: "0.5rem 0.7rem",
          color: "#ffffff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              background: "#dc2626",
              color: "#ffffff",
              fontSize: "0.7rem",
              fontWeight: "700",
              minWidth: "20px",
              height: "20px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 5px",
            }}
          >
            {toBangla(unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "340px",
              maxWidth: "calc(100vw - 2rem)",
              background: "#ffffff",
              borderRadius: "10px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: "600", color: "#0f766e", fontSize: "0.95rem" }}>
                নোটিফিকেশন
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{ background: "transparent", border: "none", color: "#0f766e", fontSize: "0.78rem", cursor: "pointer", fontWeight: "500" }}
                >
                  সব পড়া হয়েছে
                </button>
              )}
            </div>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#64748b", fontSize: "0.88rem" }}>
                  কোনো নোটিফিকেশন নেই
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = readKeys.has(n.key);
                  return (
                    <button
                      key={n.key}
                      onClick={() => handleClick(n)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "0.85rem 1rem",
                        borderBottom: "1px solid #f1f5f9",
                        background: isRead ? "#ffffff" : "#f0fdf4",
                        borderLeft: `3px solid ${n.color}`,
                        cursor: "pointer",
                        border: "none",
                        borderBottomWidth: "1px",
                        borderBottomStyle: "solid",
                        borderBottomColor: "#f1f5f9",
                        borderLeftWidth: "3px",
                        borderLeftStyle: "solid",
                        borderLeftColor: n.color,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.88rem", fontWeight: isRead ? "400" : "500", color: "#1a1a1a", marginBottom: "0.2rem" }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            {n.description}
                          </div>
                        </div>
                        {!isRead && (
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: n.color, flexShrink: 0, marginTop: "0.35rem" }} />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
