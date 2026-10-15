"use client";

import { useState, useMemo } from "react";

type Student = {
  id: number;
  student_id: string | null;
  name: string;
  class_name: string;
  roll: string | null;
  section: string | null;
  monthly_fee: number;
  discount: number;
  status: string;
};

function toBangla(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

function todayBangla(): string {
  const d = new Date();
  return `${toBangla(d.getDate())}/${toBangla(d.getMonth() + 1)}/${toBangla(d.getFullYear())}`;
}

export default function StudentsReport({
  students,
  classes,
  preparedBy,
}: {
  students: Student[];
  classes: string[];
  preparedBy: string;
}) {
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "discount">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (classFilter && s.class_name !== classFilter) return false;
      if (statusFilter === "active" && s.status !== "active") return false;
      if (statusFilter === "inactive" && s.status !== "inactive") return false;
      if (statusFilter === "discount" && (!s.discount || s.discount <= 0)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          (s.student_id || "").toLowerCase().includes(q) ||
          (s.roll || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, classFilter, statusFilter, search]);

  const totalFee = filtered.reduce((s, x) => s + Number(x.monthly_fee), 0);
  const totalDiscount = filtered.reduce((s, x) => s + Number(x.discount || 0), 0);
  const totalNetFee = totalFee - totalDiscount;

  // শ্রেণিভিত্তিক সারসংক্ষেপ
  const byClass: Record<string, number> = {};
  filtered.forEach((s) => {
    byClass[s.class_name] = (byClass[s.class_name] || 0) + 1;
  });

  return (
    <>
      <div className="no-print mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">শ্রেণি</label>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">সব শ্রেণি</option>
              {classes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">অবস্থা</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="all">সব</option>
              <option value="active">সক্রিয়</option>
              <option value="inactive">নিষ্ক্রিয়</option>
              <option value="discount">ছাড় পাওয়া</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">খুঁজুন</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম / আইডি / রোল" className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
        </div>
        <button onClick={() => window.print()} className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
          🖨️ Print / PDF
        </button>
      </div>

      <div className="print-area min-w-0 max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800">
        <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "8px 8px 0 0", borderBottom: "2px solid #0f766e" }}>
          <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            <h1 style={{ fontSize: "1.4rem", color: "#0f766e", marginBottom: "0.25rem" }}>দারুল হিকমাহ মডেল মাদ্রাসা</h1>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ</p>
          </div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <div><strong>বিষয়:</strong> শিক্ষার্থী রিপোর্ট</div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div><strong>মোট শিক্ষার্থী:</strong> {toBangla(filtered.length)} জন</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1rem 1.5rem" }}>
          <h3 style={{ fontSize: "1rem", color: "#0f766e", marginBottom: "0.6rem" }}>শ্রেণিভিত্তিক সংখ্যা</h3>
          <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", border: "1px solid #e2e8f0" }}>
            <thead>
              <tr style={{ background: "#0f766e", color: "#fff" }}>
                <th style={th}>শ্রেণি</th>
                <th style={{ ...th, textAlign: "right" }}>শিক্ষার্থী</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byClass).map(([cls, count]) => (
                <tr key={cls} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={td}>{cls}</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: "500" }}>{toBangla(count)} জন</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "#0f766e", color: "#fff" }}>
              <th style={th}>নং</th>
              <th style={th}>আইডি</th>
              <th style={th}>নাম</th>
              <th style={th}>শ্রেণি</th>
              <th style={th}>রোল</th>
              <th style={{ ...th, textAlign: "right" }}>বেতন</th>
              <th style={{ ...th, textAlign: "right" }}>ছাড়</th>
              <th style={{ ...th, textAlign: "right" }}>প্রদেয়</th>
              <th style={th}>অবস্থা</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const payable = Number(s.monthly_fee) - Number(s.discount || 0);
              return (
                <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={td}>{toBangla(i + 1)}</td>
                  <td style={td}>{s.student_id || "-"}</td>
                  <td style={{ ...td, fontWeight: "500" }}>{s.name}</td>
                  <td style={td}>{s.class_name}{s.section ? ` (${s.section})` : ""}</td>
                  <td style={td}>{s.roll || "-"}</td>
                  <td style={{ ...td, textAlign: "right" }}>৳ {toBangla(s.monthly_fee)}</td>
                  <td style={{ ...td, textAlign: "right", color: "#b45309" }}>৳ {toBangla(s.discount || 0)}</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: "500", color: "#0f766e" }}>৳ {toBangla(payable)}</td>
                  <td style={td}>
                    <span style={{
                      padding: "0.12rem 0.45rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "500",
                      background: s.status === "active" ? "#dcfce7" : "#fee2e2",
                      color: s.status === "active" ? "#15803d" : "#b91c1c",
                    }}>
                      {s.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f1f5f9", borderTop: "2px solid #0f766e" }}>
              <td colSpan={5} style={{ ...td, fontWeight: "600", textAlign: "right" }}>মোট ({toBangla(filtered.length)} জন):</td>
              <td style={{ ...td, fontWeight: "600", textAlign: "right" }}>৳ {toBangla(totalFee)}</td>
              <td style={{ ...td, fontWeight: "600", textAlign: "right", color: "#b45309" }}>৳ {toBangla(totalDiscount)}</td>
              <td style={{ ...td, fontWeight: "600", textAlign: "right", color: "#0f766e" }}>৳ {toBangla(totalNetFee)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

const lbl: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.78rem", color: "#475569", fontWeight: "500" };
const inp: React.CSSProperties = { width: "100%", padding: "0.5rem 0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", background: "#ffffff", fontFamily: "inherit" };
const th: React.CSSProperties = { padding: "0.6rem 0.7rem", textAlign: "left", fontWeight: "600", fontSize: "0.75rem", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.55rem 0.7rem", color: "#1a1a1a" };
