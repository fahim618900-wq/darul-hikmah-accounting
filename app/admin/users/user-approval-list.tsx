"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  is_held?: boolean;
  held_at?: string | null;
  held_reason?: string | null;
};

function toBangla(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())}`;
}

function roleLabel(role: string): string {
  switch (role) {
    case "admin": return "Admin";
    case "accountant": return "হিসাবরক্ষক";
    case "viewer": return "পর্যবেক্ষক";
    case "pending": return "অপেক্ষমাণ";
    default: return role;
  }
}

function roleColor(role: string): { bg: string; text: string; border: string } {
  switch (role) {
    case "admin": return { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" };
    case "accountant": return { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" };
    case "viewer": return { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe" };
    case "pending": return { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" };
    default: return { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
  }
}

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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (roleFilter && p.role !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (p.full_name || "").toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [profiles, search, roleFilter]);

  const pendingCount = profiles.filter((p) => p.role === "pending").length;
  const adminCount = profiles.filter((p) => p.role === "admin").length;
  const staffCount = profiles.filter((p) => ["accountant", "viewer"].includes(p.role)).length;
  const heldCount = profiles.filter((p) => p.is_held).length;

  async function updateRole(userId: string, newRole: string) {
    if (!confirm(`Role পরিবর্তন করে "${roleLabel(newRole)}" করতে চান?`)) return;
    setUpdating(userId);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      alert("সমস্যা: " + error.message);
      setUpdating(null);
      return;
    }

    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
    );
    setMessage("Role পরিবর্তন হয়েছে");
    setUpdating(null);
    router.refresh();
  }

  async function toggleHold(profile: Profile) {
    const isHeld = profile.is_held;
    const action = isHeld ? "Unhold" : "Hold";
    const confirmMsg = isHeld
      ? `"${profile.full_name}" কে Unhold করতে চান? সে আবার লগইন করতে পারবে।`
      : `"${profile.full_name}" কে Hold করতে চান? সে আর লগইন করতে পারবে না।`;

    if (!confirm(confirmMsg)) return;

    setUpdating(profile.id);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        is_held: !isHeld,
        held_at: isHeld ? null : new Date().toISOString(),
        held_reason: isHeld ? null : "Admin কর্তৃক Hold",
      })
      .eq("id", profile.id);

    if (error) {
      alert("সমস্যা: " + error.message);
      setUpdating(null);
      return;
    }

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === profile.id
          ? { ...p, is_held: !isHeld, held_at: isHeld ? null : new Date().toISOString() }
          : p
      )
    );
    setMessage(`${profile.full_name} কে ${action} করা হয়েছে`);
    setUpdating(null);
    router.refresh();
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* সারাংশ কার্ড */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <SummaryCard label="মোট ব্যবহারকারী" value={toBangla(profiles.length)} color="#2563eb" />
        <SummaryCard label="Admin" value={toBangla(adminCount)} color="#7c3aed" />
        <SummaryCard label="কর্মী" value={toBangla(staffCount)} color="#10b981" />
        <SummaryCard
          label="অপেক্ষমাণ"
          value={toBangla(pendingCount)}
          color={pendingCount > 0 ? "#b45309" : "#64748b"}
        />
      </div>

      {heldCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-3 mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            {toBangla(heldCount)} জন ব্যবহারকারী Hold অবস্থায় আছেন
          </span>
        </div>
      )}

      {/* ফিল্টার */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম বা role দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="">সব Role</option>
            <option value="admin">Admin</option>
            <option value="accountant">হিসাবরক্ষক</option>
            <option value="viewer">পর্যবেক্ষক</option>
            <option value="pending">অপেক্ষমাণ</option>
          </select>
        </div>
      </div>

      {message && (
        <div className="mb-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {message}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500 border border-slate-200 dark:border-slate-800">
          {profiles.length === 0 ? "কোনো ব্যবহারকারী নেই" : "কোনো ফলাফল পাওয়া যায়নি"}
        </div>
      ) : (
        <>
          {/* ============ মোবাইল: কার্ড ============ */}
          <div className="md:hidden space-y-2.5">
            {filtered.map((p) => {
              const rc = roleColor(p.role);
              const isMe = p.id === currentUserId;
              const isHeld = p.is_held;

              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: isHeld ? "#b45309" : rc.text,
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                          {(p.full_name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[15px] font-semibold text-slate-900 dark:text-white truncate mb-0.5">
                            {p.full_name || "নাম নেই"}
                            {isMe && (
                              <span className="text-[10px] text-brand-600 ml-1">(আপনি)</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            যোগ: {formatDate(p.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: rc.bg, color: rc.text }}
                        >
                          {roleLabel(p.role)}
                        </span>
                        {isHeld && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            Hold
                          </span>
                        )}
                      </div>
                    </div>

                    {!isMe && (
                      <div className="space-y-2">
                        {/* Role select */}
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 mb-1">
                            Role পরিবর্তন করুন
                          </label>
                          <select
                            value={p.role}
                            onChange={(e) => updateRole(p.id, e.target.value)}
                            disabled={updating === p.id}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none disabled:opacity-50"
                          >
                            <option value="admin">Admin</option>
                            <option value="accountant">হিসাবরক্ষক</option>
                            <option value="viewer">পর্যবেক্ষক</option>
                            <option value="pending">অপেক্ষমাণ</option>
                          </select>
                        </div>

                        {/* Hold button */}
                        <button
                          onClick={() => toggleHold(p)}
                          disabled={updating === p.id}
                          className={`w-full py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                            isHeld
                              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                              : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100"
                          }`}
                        >
                          {updating === p.id ? (
                            <div className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                          ) : isHeld ? (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Unhold করুন
                            </>
                          ) : (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                              Hold করুন
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {isMe && (
                      <div className="text-center text-[11px] text-slate-400 py-1.5">
                        এটি আপনার নিজের অ্যাকাউন্ট
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ============ ডেস্কটপ: টেবিল ============ */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">ব্যবহারকারী</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">যোগদান</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const rc = roleColor(p.role);
                    const isMe = p.id === currentUserId;
                    const isHeld = p.is_held;

                    return (
                      <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {(p.full_name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {p.full_name || "নাম নেই"}
                                {isMe && (
                                  <span className="text-[10px] text-brand-600 ml-1">(আপনি)</span>
                                )}
                              </div>
                              {p.held_reason && isHeld && (
                                <div className="text-[10px] text-amber-600 mt-0.5">{p.held_reason}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isMe ? (
                            <span
                              className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold"
                              style={{ background: rc.bg, color: rc.text }}
                            >
                              {roleLabel(p.role)}
                            </span>
                          ) : (
                            <select
                              value={p.role}
                              onChange={(e) => updateRole(p.id, e.target.value)}
                              disabled={updating === p.id}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none disabled:opacity-50"
                            >
                              <option value="admin">Admin</option>
                              <option value="accountant">হিসাবরক্ষক</option>
                              <option value="viewer">পর্যবেক্ষক</option>
                              <option value="pending">অপেক্ষমাণ</option>
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isHeld ? (
                            <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                              Hold
                            </span>
                          ) : p.role === "pending" ? (
                            <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                              অনুমোদন বাকি
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                              সক্রিয়
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {formatDate(p.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!isMe && (
                            <button
                              onClick={() => toggleHold(p)}
                              disabled={updating === p.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
                                isHeld
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              }`}
                            >
                              {updating === p.id ? "..." : isHeld ? "Unhold" : "Hold"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm"
      style={{ borderLeftWidth: "3px", borderLeftColor: color }}
    >
      <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">{label}</div>
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
    </div>
  );
}
