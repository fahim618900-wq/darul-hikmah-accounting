"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: number;
  name: string;
  student_id: string | null;
  class_name: string;
  section: string | null;
  roll: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  address: string | null;
  admission_date: string | null;
  monthly_fee: number;
  discount: number;
  status: string;
};

type Payment = {
  id: number;
  student_id: number;
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

export default function StudentView() {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Record<number, Payment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const idsRaw = localStorage.getItem("student_portal_ids");
      if (!idsRaw) {
        window.location.href = "/student";
        return;
      }

      const ids: number[] = JSON.parse(idsRaw);
      if (!ids.length) {
        window.location.href = "/student";
        return;
      }

      // শিক্ষার্থীদের তথ্য
      const { data: studentData, error: studentErr } = await supabase
        .from("students")
        .select("*")
        .in("id", ids);

      if (studentErr) {
        setError(studentErr.message);
        setLoading(false);
        return;
      }

      setStudents(studentData || []);

      // প্রত্যেকের পেমেন্ট
      const { data: paymentData, error: payErr } = await supabase
        .from("fee_payments_public")
        .select("*")
        .in("student_id", ids)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (payErr) {
        setError(payErr.message);
        setLoading(false);
        return;
      }

      const grouped: Record<number, Payment[]> = {};
      (paymentData || []).forEach((p) => {
        if (!grouped[p.student_id]) grouped[p.student_id] = [];
        grouped[p.student_id].push(p);
      });

      setPayments(grouped);
      setLoading(false);
    }

    load();
  }, []);

  function handleLogout() {
    if (!confirm("আপনি কি লগআউট করতে চান? পরেরবার আবার নাম সিলেক্ট করতে হবে।")) return;
    localStorage.removeItem("student_portal_ids");
    localStorage.removeItem("student_portal_names");
    window.location.href = "/student";
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
        লোড হচ্ছে...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#fef2f2", padding: "1.5rem", borderRadius: "8px", color: "#b91c1c" }}>
        সমস্যা: {error}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "8px", textAlign: "center" }}>
        <p style={{ marginBottom: "1rem", color: "#64748b" }}>
          কোনো তথ্য পাওয়া যায়নি।
        </p>
        <button onClick={handleLogout} style={btnSecondary}>
          আবার শুরু করুন
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", color: "#0f766e", marginBottom: "0.25rem" }}>
            দারুল হিকমাহ মডেল মাদ্রাসা
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            শিক্ষার্থী পোর্টাল
          </p>
        </div>
        <button onClick={handleLogout} style={btnSecondary}>
          লগআউট
        </button>
      </div>

      {students.map((s) => {
        const studentPayments = payments[s.id] || [];
        const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);

        return (
          <div key={s.id} style={{ background: "#ffffff", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            {/* শিক্ষার্থীর তথ্য */}
            <h2 style={{ fontSize: "1.15rem", color: "#0f766e", marginBottom: "1rem" }}>
              {s.name}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
              <Info label="শ্রেণি" value={s.class_name} />
              <Info label="রোল" value={s.roll || "-"} />
              <Info label="আইডি" value={s.student_id || "-"} />
              <Info label="শাখা" value={s.section || "-"} />
              <Info label="অভিভাবক" value={s.guardian_name || "-"} />
              <Info label="ভর্তি তারিখ" value={s.admission_date || "-"} />
            </div>

            {/* বেতনের সারসংক্ষেপ */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <Summary label="মাসিক বেতন" value={`৳ ${Number(s.monthly_fee).toLocaleString("bn-BD")}`} color="#1e40af" />
              <Summary label="ছাড়" value={`৳ ${Number(s.discount || 0).toLocaleString("bn-BD")}`} color="#b45309" />
              <Summary label="মোট পরিশোধিত" value={`৳ ${totalPaid.toLocaleString("bn-BD")}`} color="#15803d" />
            </div>

            {/* বেতনের ইতিহাস */}
            <h3 style={{ fontSize: "1rem", color: "#475569", marginBottom: "0.75rem" }}>
              বেতন পরিশোধের ইতিহাস
            </h3>

            {studentPayments.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.9rem", padding: "1rem", background: "#f8fafc", borderRadius: "6px", textAlign: "center" }}>
                এখনো কোনো বেতন পরিশোধ করা হয়নি
              </p>
            ) : (
              <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead style={{ background: "#f8fafc" }}>
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
                    {studentPayments.map((p) => (
                      <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={td}>{MONTHS[p.month - 1]}</td>
                        <td style={td}>{p.year}</td>
                        <td style={{ ...td, fontWeight: "500", color: "#15803d" }}>
                          ৳ {Number(p.amount).toLocaleString("bn-BD")}
                        </td>
                        <td style={td}>{p.payment_date}</td>
                        <td style={td}>{p.receipt_no || "-"}</td>
                        <td style={td}>
                          {p.payment_method === "cash" ? "নগদ" :
                           p.payment_method === "bkash" ? "বিকাশ" :
                           p.payment_method === "nagad" ? "নগদ (Nagad)" :
                           p.payment_method === "bank" ? "ব্যাংক" : "অন্যান্য"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ background: "#fef2f2", padding: "1rem", borderRadius: "6px", border: "1px solid #fecaca", fontSize: "0.8rem", color: "#7f1d1d", lineHeight: 1.6 }}>
        <strong>সতর্কবার্তা:</strong> এই পোর্টালে শুধু নিজের ও ভাই/বোনের তথ্য দেখা যাবে। অন্যের তথ্য দেখার চেষ্টা করলে আপনার অ্যাক্সেস বন্ধ হয়ে যাবে এবং মাদ্রাসা কর্তৃপক্ষ দায়ী থাকবে না।
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.2rem" }}>{label}</div>
      <div style={{ fontWeight: "500", color: "#1a1a1a" }}>{value}</div>
    </div>
  );
}

function Summary({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "6px", borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.2rem" }}>{label}</div>
      <div style={{ fontWeight: "600", color }}>{value}</div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "0.6rem 0.8rem",
  textAlign: "left",
  fontWeight: "600",
  color: "#475569",
  fontSize: "0.8rem",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "0.6rem 0.8rem",
  color: "#1a1a1a",
};

const btnSecondary: React.CSSProperties = {
  padding: "0.5rem 1rem",
  background: "#ffffff",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  borderRadius: "6px",
  fontSize: "0.9rem",
  fontWeight: "500",
  cursor: "pointer",
};
