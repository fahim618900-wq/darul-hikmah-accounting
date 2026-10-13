"use client";

import { useState, useMemo } from "react";

type Log = {
  id: number;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  description: string | null;
  created_at: string;
};

const TABLE_LABELS: Record<string, string> = {
  students: "শিক্ষার্থী",
  fee_payments: "বেতন আদায়",
  incomes: "আয়",
  expenses: "ব্যয়",
  profiles: "ব্যবহারকারী",
  app_settings: "সেটিংস",
};

const ACTION_LABELS: Record<string, string> = {
  insert: "যোগ",
  update: "পরিবর্তন",
  delete: "ডিলিট",
};

function toBangla(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())}`;
  const time = `${toBangla(String(d.getHours()).padStart(2, "0"))}:${toBangla(String(d.getMinutes()).padStart(2, "0"))}`;
  return `${date} ${time}`;
}

export default function AuditLogsClient({ initialLogs }: { initialLogs: Log[] }) {
  const [logs] = useState<Log[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [detailLog, setDetailLog] = useState<Log | null>(null);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (tableFilter && l.table_name !== tableFilter) return false;
      if (actionFilter && l.action !== actionFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (l.user_email || "").toLowerCase().includes(q) ||
          (l.description || "").toLowerCase().includes(q) ||
          (l.record_id || "").includes(q)
        );
      }
      return true;
    });
  }, [logs, tableFilter, actionFilter, search]);

  return (
    <>
      {detailLog && <LogDetailModal log={detailLog} onClose={() => setDetailLog(null)} />}

      {/* ফিল্টার */}
      <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
          <div>
            <label style={lbl}>খুঁজুন</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ইমেইল / বিবরণ"
              style={inp}
            />
          </div>
          <div>
            <label style={lbl}>টেবিল</label>
            <select value={tableFilter} onChange={(e) => setTableFilter(e.target.value)} style={inp}>
              <option value="">সব</option>
              <option value="students">শিক্ষার্থী</option>
              <option value="fee_payments">বেতন আদায়</option>
              <option value="incomes">আয়</option>
              <option value="expenses">ব্যয়</option>
              <option value="profiles">ব্যবহারকারী</option>
              <option value="app_settings">সেটিংস</option>
            </select>
          </div>
          <div>
            <label style={lbl}>কাজ</label>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} style={inp}>
              <option value="">সব</option>
              <option value="insert">যোগ</option>
              <option value="update">পরিবর্তন</option>
              <option value="delete">ডিলিট</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#64748b" }}>
          মোট <strong>{toBangla(filtered.length)}</strong>টি লগ পাওয়া গেছে (সর্বশেষ ৫০০টির মধ্যে)
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "8px", textAlign: "center", color: "#64748b" }}>
          কোনো লগ পাওয়া যায়নি
        </div>
      ) : (
        <div style={{ background: "#ffffff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={th}>সময়</th>
                  <th style={th}>ব্যবহারকারী</th>
                  <th style={th}>কাজ</th>
                  <th style={th}>টেবিল</th>
                  <th style={th}>বিবরণ</th>
                  <th style={th}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ ...td, whiteSpace: "nowrap", fontSize: "0.78rem", color: "#64748b" }}>
                      {formatDateTime(l.created_at)}
                    </td>
                    <td style={{ ...td, fontSize: "0.82rem" }}>
                      {l.user_email || "system"}
                      {l.user_role && (
                        <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{l.user_role}</div>
                      )}
                    </td>
                    <td style={td}>
                      <span style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.72rem",
                        fontWeight: "500",
                        background: l.action === "insert" ? "#dcfce7" : l.action === "update" ? "#dbeafe" : "#fee2e2",
                        color: l.action === "insert" ? "#15803d" : l.action === "update" ? "#1e40af" : "#b91c1c",
                      }}>
                        {ACTION_LABELS[l.action] || l.action}
                      </span>
                    </td>
                    <td style={td}>{TABLE_LABELS[l.table_name] || l.table_name}</td>
                    <td style={td}>{l.description || "-"}</td>
                    <td style={td}>
                      <button onClick={() => setDetailLog(l)} style={btnDetail}>
                        বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function LogDetailModal({ log, onClose }: { log: Log; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "2rem 1rem",
        overflowY: "auto",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "8px",
          padding: "1.75rem",
          maxWidth: "700px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", color: "#0f766e", marginBottom: "0.25rem" }}>
              বিস্তারিত লগ
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#64748b" }}>
              {formatDateTime(log.created_at)}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: "1.5rem", color: "#64748b", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
          <Info label="ব্যবহারকারী" value={log.user_email || "system"} />
          <Info label="Role" value={log.user_role || "-"} />
          <Info label="কাজ" value={ACTION_LABELS[log.action] || log.action} />
          <Info label="টেবিল" value={TABLE_LABELS[log.table_name] || log.table_name} />
          <Info label="রেকর্ড ID" value={log.record_id || "-"} />
        </div>

        {log.old_data && (
          <div style={{ marginBottom: "1rem" }}>
            <h4 style={{ fontSize: "0.9rem", color: "#b91c1c", marginBottom: "0.5rem" }}>
              {log.action === "delete" ? "ডিলিট করা ডেটা" : "পুরনো ডেটা"}
            </h4>
            <pre style={pre}>{JSON.stringify(log.old_data, null, 2)}</pre>
          </div>
        )}

        {log.new_data && (
          <div>
            <h4 style={{ fontSize: "0.9rem", color: "#15803d", marginBottom: "0.5rem" }}>
              {log.action === "insert" ? "নতুন ডেটা" : "নতুন ডেটা"}
            </h4>
            <pre style={pre}>{JSON.stringify(log.new_data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "0.2rem" }}>{label}</div>
      <div style={{ fontWeight: "500" }}>{value}</div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.78rem", color: "#475569", fontWeight: "500" };
const inp: React.CSSProperties = { width: "100%", padding: "0.5rem 0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", background: "#ffffff", fontFamily: "inherit" };
const th: React.CSSProperties = { padding: "0.7rem 0.85rem", textAlign: "left", fontWeight: "600", fontSize: "0.78rem", color: "#475569", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.7rem 0.85rem", color: "#1a1a1a", verticalAlign: "top" };
const btnDetail: React.CSSProperties = { padding: "0.3rem 0.65rem", background: "#ffffff", color: "#0f766e", border: "1px solid #0f766e", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" };
const pre: React.CSSProperties = { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "0.75rem", fontSize: "0.75rem", overflowX: "auto", maxHeight: "200px", color: "#334155" };
