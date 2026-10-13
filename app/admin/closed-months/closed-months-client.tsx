"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ClosedMonth = {
  id: number;
  month: number;
  year: number;
  closed_by_name: string | null;
  closed_at: string;
  note: string | null;
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

function toBangla(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())} ${toBangla(String(d.getHours()).padStart(2, "0"))}:${toBangla(String(d.getMinutes()).padStart(2, "0"))}`;
}

export default function ClosedMonthsClient({
  closedMonths,
  userName,
}: {
  closedMonths: ClosedMonth[];
  userName: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleClose() {
    const confirmed = confirm(
      `${MONTHS[month - 1]} ${year} মাস বন্ধ করতে চান?\n\n` +
      `এরপর এই মাসের কোনো বেতন, আয় বা ব্যয় আর পরিবর্তন করা যাবে না।\n` +
      `নিশ্চিত হয়ে ক্লিক করুন।`
    );
    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setError("");

    const userRes = await supabase.auth.getUser();
    const userId = userRes.data.user?.id;

    const { error: err } = await supabase.from("closed_months").insert({
      month,
      year,
      closed_by: userId,
      closed_by_name: userName,
      note: note || null,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setMessage(`${MONTHS[month - 1]} ${toBangla(year)} সফলভাবে বন্ধ করা হয়েছে`);
    setNote("");
    setLoading(false);
    router.refresh();
  }

  async function handleUnlock(cm: ClosedMonth) {
    const confirmed = confirm(
      `⚠️ ${MONTHS[cm.month - 1]} ${cm.year} আনলক করতে চান?\n\n` +
      `এটি করলে সেই মাসের হিসাব আবার পরিবর্তন করা যাবে।\n` +
      `শুধুমাত্র প্রয়োজনে করুন।`
    );
    if (!confirmed) return;

    setLoading(true);
    setError("");
    const { error: err } = await supabase
      .from("closed_months")
      .delete()
      .eq("id", cm.id);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setMessage(`${MONTHS[cm.month - 1]} ${toBangla(cm.year)} আনলক করা হয়েছে`);
    setLoading(false);
    router.refresh();
  }

  const canCloseCurrentOrPast =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month <= now.getMonth() + 1);

  const alreadyClosed = closedMonths.some(
    (cm) => cm.month === month && cm.year === year
  );

  return (
    <>
      <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", maxWidth: "600px" }}>
        <h3 style={{ fontSize: "1.1rem", color: "#0f766e", marginBottom: "1rem" }}>
          নতুন মাস বন্ধ করুন
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div>
            <label style={lbl}>মাস</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={inp}>
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>বছর</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min={2020} max={2100} style={inp} />
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={lbl}>নোট (ঐচ্ছিক)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="যেমন: ডিসেম্বরের হিসাব যাচাই করা হয়েছে" style={inp} />
        </div>

        {alreadyClosed && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "#fef3c7", color: "#b45309", borderRadius: "6px", fontSize: "0.85rem" }}>
            ⚠️ এই মাস ইতিমধ্যে বন্ধ করা হয়েছে
          </div>
        )}

        {!canCloseCurrentOrPast && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.85rem" }}>
            ভবিষ্যতের মাস বন্ধ করা যাবে না
          </div>
        )}

        <button
          onClick={handleClose}
          disabled={loading || alreadyClosed || !canCloseCurrentOrPast}
          style={{
            padding: "0.65rem 1.5rem",
            background: alreadyClosed || !canCloseCurrentOrPast ? "#cbd5e1" : "#b91c1c",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: "500",
            cursor: alreadyClosed || !canCloseCurrentOrPast || loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "বন্ধ হচ্ছে..." : "🔒 মাস বন্ধ করুন"}
        </button>

        {message && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#dcfce7", color: "#15803d", borderRadius: "6px", fontSize: "0.85rem" }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h3 style={{ fontSize: "1.1rem", color: "#0f766e", marginBottom: "1rem" }}>
          বন্ধ করা মাসের তালিকা ({toBangla(closedMonths.length)}টি)
        </h3>

        {closedMonths.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "1rem" }}>এখনো কোনো মাস বন্ধ করা হয়নি</p>
        ) : (
          <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={th}>মাস</th>
                  <th style={th}>বছর</th>
                  <th style={th}>বন্ধ করেছেন</th>
                  <th style={th}>সময়</th>
                  <th style={th}>নোট</th>
                  <th style={th}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {closedMonths.map((cm) => (
                  <tr key={cm.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ ...td, fontWeight: "500" }}>{MONTHS[cm.month - 1]}</td>
                    <td style={td}>{toBangla(cm.year)}</td>
                    <td style={td}>{cm.closed_by_name || "-"}</td>
                    <td style={{ ...td, fontSize: "0.78rem", color: "#64748b" }}>{formatDateTime(cm.closed_at)}</td>
                    <td style={td}>{cm.note || "-"}</td>
                    <td style={td}>
                      <button
                        onClick={() => handleUnlock(cm)}
                        disabled={loading}
                        style={{ padding: "0.3rem 0.65rem", background: "#ffffff", color: "#b45309", border: "1px solid #b45309", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
                      >
                        আনলক
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

const lbl: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.78rem", color: "#475569", fontWeight: "500" };
const inp: React.CSSProperties = { width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.88rem", background: "#ffffff", fontFamily: "inherit" };
const th: React.CSSProperties = { padding: "0.7rem 0.85rem", textAlign: "left", fontWeight: "600", fontSize: "0.78rem", color: "#475569", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.7rem 0.85rem", color: "#1a1a1a" };
