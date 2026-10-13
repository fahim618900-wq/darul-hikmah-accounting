"use client";

import Link from "next/link";

type Student = {
  id: number;
  student_id: string | null;
  name: string;
  class_name: string;
  section: string | null;
  roll: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  address: string | null;
  admission_date: string | null;
  monthly_fee: number;
  discount: number;
  discount_reason: string | null;
  status: string;
};

type Payment = {
  id: number;
  month: number;
  year: number;
  amount: number;
  payment_date: string;
  receipt_no: string | null;
  payment_method: string;
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

export default function StudentProfile({
  student,
  payments,
}: {
  student: Student;
  payments: Payment[];
}) {
  const payable = Number(student.monthly_fee || 0) - Number(student.discount || 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  // মাসভিত্তিক হিসাব
  const monthlyMap: Record<string, { paid: number; payments: Payment[] }> = {};
  payments.forEach((p) => {
    const key = `${p.year}-${String(p.month).padStart(2, "0")}`;
    if (!monthlyMap[key]) monthlyMap[key] = { paid: 0, payments: [] };
    monthlyMap[key].paid += Number(p.amount);
    monthlyMap[key].payments.push(p);
  });

  return (
    <>
      {/* প্রিন্টে লুকানোর জন্য */}
      <div className="no-print">
        <Link
          href="/dashboard/students"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "#0f766e",
            fontSize: "0.9rem",
            marginBottom: "1.25rem",
            textDecoration: "none",
          }}
        >
          ← শিক্ষার্থী তালিকায় ফিরে যান
        </Link>
      </div>

      <div className="print-area">
        {/* হেডার */}
        <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "0.35rem" }}>
                {student.name}
              </h1>
              <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                {student.class_name}
                {student.section && ` — শাখা: ${student.section}`}
                {student.roll && ` | রোল: ${student.roll}`}
                {student.student_id && ` | আইডি: ${student.student_id}`}
              </p>
            </div>
            <span
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
                fontWeight: "500",
                background: student.status === "active" ? "#dcfce7" : "#fee2e2",
                color: student.status === "active" ? "#15803d" : "#b91c1c",
              }}
            >
              {student.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
            </span>
          </div>
        </div>

        {/* তথ্য কার্ড */}
        <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "1rem", color: "#0f766e", marginBottom: "1rem" }}>
            শিক্ষার্থীর তথ্য
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <Info label="অভিভাবকের নাম" value={student.guardian_name || "-"} />
            <Info label="অভিভাবকের ফোন" value={student.guardian_phone || "-"} />
            <Info label="ভর্তি তারিখ" value={student.admission_date || "-"} />
            <Info label="মাসিক বেতন" value={`৳ ${toBangla(student.monthly_fee)}`} />
            <Info label="ছাড়" value={`৳ ${toBangla(student.discount || 0)}`} />
            <Info label="প্রদেয়" value={`৳ ${toBangla(payable)}`} highlight />
            {student.discount_reason && (
              <Info label="ছাড়ের কারণ" value={student.discount_reason} />
            )}
            {student.address && (
              <Info label="ঠিকানা" value={student.address} />
            )}
          </div>
        </div>

        {/* সারসংক্ষেপ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
          <SummaryCard label="মোট পেমেন্ট" value={payments.length} suffix="বার" color="#1e40af" isCount />
          <SummaryCard label="মোট পরিশোধিত" value={`৳ ${toBangla(totalPaid)}`} color="#15803d" />
          <SummaryCard label="মাসিক প্রদেয়" value={`৳ ${toBangla(payable)}`} color="#0f766e" />
        </div>

        {/* বেতন ইতিহাস */}
        <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "1rem", color: "#0f766e", marginBottom: "1rem" }}>
            বেতন পরিশোধের ইতিহাস ({toBangla(payments.length)}টি)
          </h2>

          {payments.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.9rem", padding: "1rem", background: "#f8fafc", borderRadius: "6px", textAlign: "center" }}>
              এখনো কোনো বেতন পরিশোধ করা হয়নি
            </p>
          ) : (
            <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
              <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#0f766e", color: "#fff" }}>
                    <th style={th}>নং</th>
                    <th style={th}>মাস</th>
                    <th style={th}>বছর</th>
                    <th style={th}>পরিমাণ</th>
                    <th style={th}>তারিখ</th>
                    <th style={th}>রসিদ নম্বর</th>
                    <th style={th}>পদ্ধতি</th>
                    <th style={th}>নোট</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={td}>{toBangla(i + 1)}</td>
                      <td style={td}>{MONTHS[p.month - 1]}</td>
                      <td style={td}>{toBangla(p.year)}</td>
                      <td style={{ ...td, color: "#15803d", fontWeight: "500" }}>
                        ৳ {toBangla(p.amount)}
                      </td>
                      <td style={td}>{toBangla(p.payment_date)}</td>
                      <td style={{ ...td, fontSize: "0.78rem", color: "#0f766e", fontWeight: "500" }}>
                        {p.receipt_no || "-"}
                      </td>
                      <td style={td}>
                        {p.payment_method === "cash" ? "নগদ" :
                         p.payment_method === "bkash" ? "বিকাশ" :
                         p.payment_method === "nagad" ? "নগদ (Nagad)" :
                         p.payment_method === "bank" ? "ব্যাংক" : "অন্যান্য"}
                      </td>
                      <td style={td}>{p.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f1f5f9", borderTop: "2px solid #0f766e" }}>
                    <td colSpan={3} style={{ ...td, fontWeight: "600", textAlign: "right" }}>মোট:</td>
                    <td style={{ ...td, fontWeight: "600", color: "#15803d" }}>৳ {toBangla(totalPaid)}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Info({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>{label}</div>
      <div style={{ fontWeight: highlight ? "600" : "500", color: highlight ? "#0f766e" : "#1a1a1a" }}>{value}</div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  suffix,
  color,
  isCount,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  color: string;
  isCount?: boolean;
}) {
  return (
    <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", borderLeft: `4px solid ${color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.3rem" }}>{label}</div>
      <div style={{ fontSize: "1.1rem", fontWeight: "600", color }}>
        {value}
        {suffix && <span style={{ fontSize: "0.8rem", marginLeft: "0.25rem", color: "#64748b" }}>{suffix}</span>}
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "0.7rem 0.85rem", textAlign: "left", fontWeight: "600", fontSize: "0.78rem", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.7rem 0.85rem", color: "#1a1a1a" };
