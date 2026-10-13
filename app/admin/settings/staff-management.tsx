"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Staff = {
  id: string;
  full_name: string | null;
  role: string;
  is_held: boolean | null;
  held_at: string | null;
  held_reason: string | null;
  created_at: string;
};

export default function StaffManagement({
  staff,
  currentUserId,
}: {
  staff: Staff[];
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [holdModal, setHoldModal] = useState<Staff | null>(null);
  const [holdReason, setHoldReason] = useState("");

  async function updateRole(userId: string, newRole: string) {
    if (!confirm(`Role পরিবর্তন করে "${newRole}" করতে চান?`)) return;
    setLoading(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);
    if (error) {
      alert("সমস্যা: " + error.message);
    } else {
      router.refresh();
    }
    setLoading(null);
  }

  async function handleHold(userId: string, reason: string) {
    setLoading(userId);
    const { error } = await supabase
      .from("profiles")
      .update({
        is_held: true,
        held_at: new Date().toISOString(),
        held_reason: reason,
      })
      .eq("id", userId);
    if (error) {
      alert("সমস্যা: " + error.message);
    } else {
      setHoldModal(null);
      setHoldReason("");
      router.refresh();
    }
    setLoading(null);
  }

  async function handleUnhold(userId: string) {
    if (!confirm("এই কর্মচারীর Hold তুলে দিতে চান? সে আবার লগইন করতে পারবে।")) return;
    setLoading(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ is_held: false, held_at: null, held_reason: null })
      .eq("id", userId);
    if (error) {
      alert("সমস্যা: " + error.message);
    } else {
      router.refresh();
    }
    setLoading(null);
  }

  async function handleDelete(userId: string, name: string) {
    const confirmed = confirm(
      `"${name}" কে স্থায়ীভাবে ডিলিট করতে চান?\n\n` +
      `এই কর্মচারী আর কখনো লগইন করতে পারবে না।\n` +
      `এই কাজটি ফিরিয়ে আনা যাবে না।`
    );
    if (!confirmed) return;

    setLoading(userId);

    // profiles থেকে ডিলিট (CASCADE-এ auth.users থেকে ডিলিট হবে না — আলাদা API লাগবে)
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      alert("সমস্যা: " + error.message);
      setLoading(null);
      return;
    }

    router.refresh();
    setLoading(null);
  }

  return (
    <>
      {/* Hold Modal */}
      {holdModal && (
        <div
          onClick={() => setHoldModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "8px",
              padding: "1.5rem",
              maxWidth: "420px",
              width: "100%",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", color: "#b45309", marginBottom: "0.75rem" }}>
              কর্মচারী Hold করুন
            </h3>
            <p style={{ fontSize: "0.88rem", color: "#475569", marginBottom: "1rem" }}>
              <strong>{holdModal.full_name}</strong> কে Hold করলে সে আর লগইন করতে পারবে না। তবে তার তথ্য মুছে যাবে না।
            </p>
            <label style={{ display: "block", fontSize: "0.82rem", color: "#475569", marginBottom: "0.35rem", fontWeight: "500" }}>
              কারণ (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              placeholder="যেমন: ছুটিতে আছে"
              style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.9rem", marginBottom: "1rem" }}
            />
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => { setHoldModal(null); setHoldReason(""); }}
                style={{ padding: "0.5rem 1rem", background: "#ffffff", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.88rem" }}
              >
                বাতিল
              </button>
              <button
                onClick={() => handleHold(holdModal.id, holdReason)}
                disabled={loading === holdModal.id}
                style={{ padding: "0.5rem 1rem", background: "#b45309", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "0.88rem", fontWeight: "500" }}
              >
                {loading === holdModal.id ? "..." : "Hold করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h3 style={{ fontSize: "1.1rem", color: "#0f766e", marginBottom: "0.35rem" }}>
          কর্মচারী ব্যবস্থাপনা
        </h3>
        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
          Role পরিবর্তন, Hold ও ডিলিট করুন
        </p>

        {staff.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "1rem" }}>কোনো কর্মচারী নেই</p>
        ) : (
          <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={th}>নাম</th>
                  <th style={th}>Role</th>
                  <th style={th}>অবস্থা</th>
                  <th style={th}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => {
                  const isMe = s.id === currentUserId;
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ ...td, fontWeight: "500" }}>
                        {s.full_name || "-"}
                        {isMe && <span style={{ marginLeft: "0.4rem", fontSize: "0.72rem", color: "#0f766e" }}>(আপনি)</span>}
                        {s.is_held && s.held_reason && (
                          <div style={{ fontSize: "0.72rem", color: "#b45309", marginTop: "0.15rem" }}>
                            কারণ: {s.held_reason}
                          </div>
                        )}
                      </td>
                      <td style={td}>
                        {isMe ? (
                          <span style={{ fontWeight: "500" }}>{s.role}</span>
                        ) : (
                          <select
                            value={s.role}
                            onChange={(e) => updateRole(s.id, e.target.value)}
                            disabled={loading === s.id}
                            style={{ padding: "0.35rem 0.5rem", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.82rem", background: "#ffffff" }}
                          >
                            <option value="admin">Admin</option>
                            <option value="accountant">Accountant</option>
                            <option value="viewer">Viewer</option>
                            <option value="pending">Pending</option>
                          </select>
                        )}
                      </td>
                      <td style={td}>
                        {s.is_held ? (
                          <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.72rem", background: "#fef3c7", color: "#b45309", fontWeight: "500" }}>
                            Hold
                          </span>
                        ) : s.role === "pending" ? (
                          <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.72rem", background: "#fef2f2", color: "#b91c1c", fontWeight: "500" }}>
                            Pending
                          </span>
                        ) : (
                          <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.72rem", background: "#dcfce7", color: "#15803d", fontWeight: "500" }}>
                            সক্রিয়
                          </span>
                        )}
                      </td>
                      <td style={td}>
                        {!isMe && (
                          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                            {s.is_held ? (
                              <button
                                onClick={() => handleUnhold(s.id)}
                                disabled={loading === s.id}
                                style={btnGreen}
                              >
                                Unhold
                              </button>
                            ) : (
                              <button
                                onClick={() => setHoldModal(s)}
                                disabled={loading === s.id}
                                style={btnAmber}
                              >
                                Hold
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(s.id, s.full_name || "কর্মচারী")}
                              disabled={loading === s.id}
                              style={btnRed}
                            >
                              ডিলিট
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

const th: React.CSSProperties = { padding: "0.7rem 0.85rem", textAlign: "left", fontWeight: "600", fontSize: "0.78rem", color: "#475569", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.7rem 0.85rem", color: "#1a1a1a", verticalAlign: "middle" };
const btnGreen: React.CSSProperties = { padding: "0.3rem 0.65rem", background: "#ffffff", color: "#15803d", border: "1px solid #15803d", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" };
const btnAmber: React.CSSProperties = { padding: "0.3rem 0.65rem", background: "#ffffff", color: "#b45309", border: "1px solid #b45309", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" };
const btnRed: React.CSSProperties = { padding: "0.3rem 0.65rem", background: "#ffffff", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" };
