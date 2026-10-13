"use client";

import { useState, useMemo } from "react";

type Transaction = {
  type: string;
  id: number;
  date: string;
  category: string | null;
  amount: number;
  ref_no: string | null;
  description: string | null;
  payment_method: string;
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

export default function TransactionsReport({
  transactions,
  preparedBy,
}: {
  transactions: Transaction[];
  preparedBy: string;
}) {
  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(lastOfMonth);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [receiptSearch, setReceiptSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [descSearch, setDescSearch] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (t.date < fromDate || t.date > toDate) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (receiptSearch && !(t.ref_no || "").toLowerCase().includes(receiptSearch.toLowerCase())) return false;
      if (categorySearch && !(t.category || "").toLowerCase().includes(categorySearch.toLowerCase())) return false;
      if (descSearch && !(t.description || "").toLowerCase().includes(descSearch.toLowerCase())) return false;
      return true;
    });
  }, [transactions, fromDate, toDate, typeFilter, receiptSearch, categorySearch, descSearch]);

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  function clearFilters() {
    setReceiptSearch("");
    setCategorySearch("");
    setDescSearch("");
    setTypeFilter("all");
  }

  return (
    <>
      <div className="no-print" style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div>
            <label style={lbl}>শুরুর তারিখ</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>শেষের তারিখ</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>ধরন</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} style={inp}>
              <option value="all">সব</option>
              <option value="income">শুধু আয়</option>
              <option value="expense">শুধু ব্যয়</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div>
            <label style={lbl}>🔍 রসিদ / ভাউচার নম্বর</label>
            <input
              type="text"
              value={receiptSearch}
              onChange={(e) => setReceiptSearch(e.target.value)}
              placeholder="R-202610-..."
              style={{ ...inp, borderColor: receiptSearch ? "#0f766e" : "#cbd5e1" }}
            />
          </div>
          <div>
            <label style={lbl}>🔍 খাত</label>
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="বেতন, বিদ্যুৎ..."
              style={inp}
            />
          </div>
          <div>
            <label style={lbl}>🔍 বিবরণ</label>
            <input
              type="text"
              value={descSearch}
              onChange={(e) => setDescSearch(e.target.value)}
              placeholder="কোনো লেখা..."
              style={inp}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={() => window.print()} style={{ padding: "0.55rem 1.1rem", background: "#0f766e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.88rem", fontWeight: "500", cursor: "pointer" }}>
            🖨️ Print / PDF
          </button>
          <button onClick={clearFilters} style={{ padding: "0.55rem 1.1rem", background: "#ffffff", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.88rem", cursor: "pointer" }}>
            ফিল্টার মুছুন
          </button>
        </div>
      </div>

      <div className="print-area">
        <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "8px 8px 0 0", borderBottom: "2px solid #0f766e" }}>
          <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            <h1 style={{ fontSize: "1.4rem", color: "#0f766e", marginBottom: "0.25rem" }}>দারুল হিকমাহ মডেল মাদ্রাসা</h1>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem", marginBottom: "0.35rem" }}>
            <div><strong>বিষয়:</strong> লেনদেনের রিপোর্ট</div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem" }}>
            <div><strong>সময়কাল:</strong> {toBangla(fromDate)} — {toBangla(toDate)}</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
          {(receiptSearch || categorySearch || descSearch) && (
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.35rem" }}>
              {receiptSearch && <span>রসিদ: <strong>{receiptSearch}</strong> </span>}
              {categorySearch && <span>| খাত: <strong>{categorySearch}</strong> </span>}
              {descSearch && <span>| বিবরণ: <strong>{descSearch}</strong></span>}
            </div>
          )}
        </div>

        <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ background: "#0f766e", color: "#fff" }}>
              <th style={th}>নং</th>
              <th style={th}>তারিখ</th>
              <th style={th}>ধরন</th>
              <th style={th}>খাত</th>
              <th style={th}>রসিদ / ভাউচার</th>
              <th style={th}>বিবরণ</th>
              <th style={{ ...th, textAlign: "right" }}>পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...td, textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  কোনো লেনদেন নেই
                </td>
              </tr>
            ) : (
              filtered.map((t, i) => (
                <tr key={`${t.type}-${t.id}`} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={td}>{toBangla(i + 1)}</td>
                  <td style={td}>{toBangla(t.date)}</td>
                  <td style={td}>
                    <span style={{
                      padding: "0.12rem 0.45rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "500",
                      background: t.type === "income" ? "#dcfce7" : "#fee2e2",
                      color: t.type === "income" ? "#15803d" : "#b91c1c",
                    }}>
                      {t.type === "income" ? "আয়" : "ব্যয়"}
                    </span>
                  </td>
                  <td style={td}>{t.category || "-"}</td>
                  <td style={{ ...td, fontSize: "0.72rem", fontWeight: "500", color: "#0f766e" }}>{t.ref_no || "-"}</td>
                  <td style={td}>{t.description || "-"}</td>
                  <td style={{ ...td, textAlign: "right", color: t.type === "income" ? "#15803d" : "#b91c1c", fontWeight: "500" }}>
                    ৳ {toBangla(t.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f1f5f9", borderTop: "2px solid #0f766e" }}>
              <td colSpan={6} style={{ ...td, fontWeight: "600", textAlign: "right" }}>
                মোট আয়: ৳ {toBangla(totalIncome)} | মোট ব্যয়: ৳ {toBangla(totalExpense)}
              </td>
              <td style={{ ...td, fontWeight: "700", textAlign: "right", color: (totalIncome - totalExpense) >= 0 ? "#15803d" : "#b91c1c" }}>
                ৳ {toBangla(totalIncome - totalExpense)}
              </td>
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
