"use client";

type Student = {
  id: number;
  student_id: string | null;
  name: string;
  class_name: string;
  section: string | null;
  roll: string | null;
  monthly_fee: number;
  discount: number;
};

type Payment = {
  id: number;
  month: number;
  year: number;
  amount: number;
  payment_date: string;
  receipt_no: string | null;
  payment_method: string;
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

export default function StudentDetailModal({
  student,
  payments,
  onClose,
}: {
  student: Student;
  payments: Payment[];
  onClose: () => void;
}) {
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const payable = Number(student.monthly_fee) - Number(student.discount || 0);

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
          maxWidth: "640px",
          width: "100%",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", color: "#0f766e", marginBottom: "0.25rem" }}>
              {student.name}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              {student.class_name}
              {student.section && ` — ${student.section}`}
              {student.roll && ` | রোল: ${student.roll}`}
              {student.student_id && ` | আইডি: ${student.student_id}`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: "1.5rem", color: "#64748b", cursor: "pointer", padding: "0", lineHeight: 1 }}>
            ×
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <MiniCard label="নির্ধারিত ফি" value={`৳ ${payable.toLocaleString("bn-BD")}`} color="#1e40af" />
          <MiniCard label="মোট জমা" value={`৳ ${totalPaid.toLocaleString("bn-BD")}`} color="#15803d" />
          <MiniCard label="বাকি" value={`৳ ${(payable - totalPaid).toLocaleString("bn-BD")}`} color="#b91c1c" />
        </div>

        <h4 style={{ fontSize: "0.95rem", color: "#475569", marginBottom: "0.75rem" }}>
          পেমেন্ট হিস্ট্রি ({payments.length}টি)
        </h4>

        {payments.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "0.9rem", padding: "1rem", background: "#f8fafc", borderRadius: "6px", textAlign: "center" }}>
            এখনো কোনো পেমেন্ট নেই
          </p>
        ) : (
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden", maxHeight: "300px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead style={{ background: "#f8fafc", position: "sticky", top: 0 }}>
                <tr>
                  <th style={th}>মাস</th>
                  <th style={th}>বছর</th>
                  <th style={th}>পরিমাণ</th>
                  <th style={th}>তারিখ</th>
                  <th style={th}>রসিদ</th>
                  <th style={th}>পদ্ধতি</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={td}>{MONTHS[p.month - 1]}</td>
                    <td style={td}>{p.year}</td>
                    <td style={{ ...td, color: "#15803d", fontWeight: "500" }}>
                      ৳ {Number(p.amount).toLocaleString("bn-BD")}
                    </td>
                    <td style={td}>{p.payment_date}</td>
                    <td style={td}>{p.receipt_no || "-"}</td>
                    <td style={td}>
                      {p.payment_method === "cash" ? "নগদ" :
                       p.payment_method === "bkash" ? "বিকাশ" :
                       p.payment_method === "nagad" ? "নগদ" :
                       p.payment_method === "bank" ? "ব্যাংক" : "অন্যান্য"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: "#f8fafc", padding: "0.65rem", borderRadius: "6px", borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "0.2rem" }}>{label}</div>
      <div style={{ fontWeight: "600", color, fontSize: "0.9rem" }}>{value}</div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "0.5rem 0.7rem", textAlign: "left", fontWeight: "600", color: "#475569", fontSize: "0.75rem", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.5rem 0.7rem", color: "#1a1a1a" };
