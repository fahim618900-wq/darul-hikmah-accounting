"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
};

export default function UserApprovalList({
  initialProfiles,
  currentUserId,
}: {
  initialProfiles: Profile[];
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateRole(userId: string, newRole: string) {
    setUpdating(userId);

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      alert("সমস্যা হয়েছে: " + error.message);
      setUpdating(null);
      return;
    }

    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
    );
    setUpdating(null);
    router.refresh();
  }

  if (profiles.length === 0) {
    return (
      <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "8px", textAlign: "center", color: "#64748b" }}>
        এখনো কোনো ব্যবহারকারী নেই।
      </div>
    );
  }

  return (
    <div style={{ background: "#ffffff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      {profiles.map((p, index) => (
        <div
          key={p.id}
          style={{
            padding: "1rem 1.5rem",
            borderTop: index === 0 ? "none" : "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>
              {p.full_name}
              {p.id === currentUserId && (
                <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#0f766e" }}>
                  (আপনি)
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Role: <strong>{p.role}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {p.id !== currentUserId && (
              <>
                <button
                  onClick={() => updateRole(p.id, "accountant")}
                  disabled={updating === p.id || p.role === "accountant"}
                  style={{
                    padding: "0.4rem 0.8rem",
                    background: p.role === "accountant" ? "#0f766e" : "#ffffff",
                    color: p.role === "accountant" ? "#ffffff" : "#0f766e",
                    border: "1px solid #0f766e",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    cursor: updating === p.id ? "wait" : "pointer",
                    opacity: updating === p.id ? 0.6 : 1,
                  }}
                >
                  Accountant
                </button>
                <button
                  onClick={() => updateRole(p.id, "viewer")}
                  disabled={updating === p.id || p.role === "viewer"}
                  style={{
                    padding: "0.4rem 0.8rem",
                    background: p.role === "viewer" ? "#0f766e" : "#ffffff",
                    color: p.role === "viewer" ? "#ffffff" : "#0f766e",
                    border: "1px solid #0f766e",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    cursor: updating === p.id ? "wait" : "pointer",
                    opacity: updating === p.id ? 0.6 : 1,
                  }}
                >
                  Viewer
                </button>
                <button
                  onClick={() => updateRole(p.id, "pending")}
                  disabled={updating === p.id || p.role === "pending"}
                  style={{
                    padding: "0.4rem 0.8rem",
                    background: "#ffffff",
                    color: "#b91c1c",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    cursor: updating === p.id ? "wait" : "pointer",
                    opacity: updating === p.id ? 0.6 : 1,
                  }}
                >
                  Pending
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
