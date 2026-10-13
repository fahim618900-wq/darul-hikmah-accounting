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

export default function StudentView() {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Record<number, Payment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preparedBy, setPreparedBy] = useState("");

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

      const { data: paymentData, error: payErr } = await supabase
        .from("fee_payments")
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

  function handlePrint() {
    window.print();
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
        <p style={{ color: "#64748b" }}>কোনো তথ্য পাওয়া যায়নি।</p>
      </div>
    );
  }

  // বকেয়া নোটিফিকেশন তৈরি
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const dueNotifications = students
    .map((s) => {
      const sp = payments[s.id] || [];
      const monthPayments = sp.filter((p) => p.month === currentMonth && p.year === currentYear);
      const paid = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const payable = Number(s.monthly_fee) - Number(s.discount || 0);
      const due = payable - paid;
      return { student: s, due, payable, paid };
    })
    .filter((x) => x.due > 0);

  const totalDue = dueNotifications.reduce((sum, x) => sum + x.due, 0);

  return (
    <>
      {/* বকেয়া নোটিফিকেশন বার */}
      {dueNotifications.length > 0 && (
        <div className="no-print" style={{ background: "#fef3c7", border: "1px solid #fcd34d", padding: "1rem 1.25rem", borderRadius: "8px", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "0.15rem" }}>
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <div style={{ fontWeight: "600", color: "#78350f", fontSize: "0.95rem", marginBottom: "0.35rem" }}>
                {MONTHS[currentMonth - 1]} {toBangla(currentYear)} মাসের বেতন বাকি
              </div>
              <div style={{ fontSize: "0.85rem", color: "#92400e" }}>
                {dueNotifications.length === 1 && dueNotifications[0].student.id === students[0].id ? (
                  <>আপনার এই মাসের বেতন <strong>৳ {toBangla(totalDue)}</strong> বাকি আছে।</>
                ) : (
                  <>{toBangla(dueNotifications.length)} জনের মোট বাকি <strong>৳ {toBangla(totalDue)}</strong></>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* স্ক্রিনে বাটন */}
      <div className="no-print" style={{ background: "#ffffff", padding: "0.85rem 1rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
  
  return (
    <>
      {/* স্ক্রিনে বাটন */}
      <div className="no-print" style={{ background: "#ffffff", padding: "0.85rem 1rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.78rem", color: "#475569", fontWeight: "500" }}>
            প্রস্তুতকারীর নাম (প্রিন্টে দেখাবে)
          </label>
          <input
            type="text"
            value={preparedBy}
            onChange={(e) => setPreparedBy(e.target.value)}
            placeholder="আপনার নাম"
            style={{ width: "100%", padding: "0.5rem 0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
          />
        </div>
        <button
          onClick={handlePrint}
          style={{ padding: "0.55rem 1.1rem", background: "#0f766e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.88rem", fontWeight: "500", cursor: "pointer" }}
        >
          🖨️ Print / PDF
        </button>
      </div>

      {/* প্রিন্ট হেডার */}
      <div className="print-area">
        <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "8px 8px 0 0", borderBottom: "2px solid #0f766e", marginBottom: "1rem" }}>
          <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            <h1 style={{ fontSize: "1.4rem", color: "#0f766e", marginBottom: "0.25rem" }}>
              দারুল হিকমাহ মডেল মাদ্রাসা
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem", marginBottom: "0.35rem" }}>
            <div><strong>বিষয়:</strong> শিক্ষার্থীর তথ্য ও বেতন ইতিহাস</div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem" }}>
            <div><strong>মোট শিক্ষার্থী:</strong> {toBangla(students.length)} জন</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        {students.map((s) => {
          const studentPayments = payments[s.id] || [];
          const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
          const payable = Number(s.monthly_fee) - Number(s.discount || 0);

          return (
            <div key={s.id} style={{ background: "#ffffff", borderRadius: "8px", padding: "1.5rem", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <h2 style={{ fontSize: "1.15rem", color: "#0f766e", marginBottom: "0.85rem" }}>
                {s.name}
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem", fontSize: "0.88rem" }}>
                <Info label="শ্রেণি" value={s.class_name} />
                <Info label="রোল" value={s.roll || "-"} />
                <Info label="আইডি" value={s.student_id || "-"} />
                <Info label="শাখা" value={s.section || "-"} />
                <Info label="অভিভাবক" value={s.guardian_name || "-"} />
                <Info label="ভর্তি তারিখ" value={s.admission_date || "-"} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                <MiniCard label="মাসিক বেতন" value={`৳ ${toBangla(s.monthly_fee)}`} color="#1e40af" />
                <MiniCard label="ছাড়" value={`৳ ${toBangla(s.discount || 0)}`} color="#b45309" />
                <MiniCard label="মাসিক প্রদেয়" value={`৳ ${toBangla(payable)}`} color="#0f766e" />
                <MiniCard label="মোট পরিশোধিত" value={`৳ ${toBangla(totalPaid)}`} color="#15803d" />
              </div>

              <h3 style={{ fontSize: "0.95rem", color: "#475569", marginBottom: "0.6rem" }}>
                বেতন পরিশোধের ইতিহাস ({toBangla(studentPayments.length)}টি)
              </h3>

              {studentPayments.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "0.88rem", padding: "0.75rem", background: "#f8fafc", borderRadius: "6px", textAlign: "center" }}>
                  এখনো কোনো বেতন পরিশোধ করা হয়নি
                </p>
              ) : (
                <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                  <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ background: "#0f766e", color: "#fff" }}>
                        <th style={th}>নং</th>
                        <th style={th}>মাস</th>
                        <th style={th}>বছর</th>
                        <th style={th}>পরিমাণ</th>
                        <th style={th}>তারিখ</th>
                        <th style={th}>রসিদ নম্বর</th>
                        <th style={th}>পদ্ধতি</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentPayments.map((p, i) => (
                        <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={td}>{toBangla(i + 1)}</td>
                          <td style={td}>{MONTHS[p.month - 1]}</td>
                          <td style={td}>{toBangla(p.year)}</td>
                          <td style={{ ...td, color: "#15803d", fontWeight: "500" }}>
                            ৳ {toBangla(p.amount)}
                          </td>
                          <td style={td}>{toBangla(p.payment_date)}</td>
                          <td style={{ ...td, fontSize: "0.75rem", color: "#0f766e" }}>{p.receipt_no || "-"}</td>
                          <td style={td}>
                            {p.payment_method === "cash" ? "নগদ" :
                             p.payment_method === "bkash" ? "বিকাশ" :
                             p.payment_method === "nagad" ? "নগদ (Nagad)" :
                             p.payment_method === "bank" ? "ব্যাংক" : "অন্যান্য"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: "#f1f5f9", borderTop: "2px solid #0f766e" }}>
                        <td colSpan={3} style={{ ...td, fontWeight: "600", textAlign: "right" }}>মোট:</td>
                        <td style={{ ...td, fontWeight: "600", color: "#15803d" }}>৳ {toBangla(totalPaid)}</td>
                        <td colSpan={3}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {/* সতর্কবার্তা */}
        <div style={{ background: "#fef2f2", padding: "1rem", borderRadius: "6px", border: "1px solid #fecaca", fontSize: "0.8rem", color: "#7f1d1d", lineHeight: 1.6 }}>
          <strong>সতর্কবার্তা:</strong> এই পোর্টালে শুধু নিজের ও ভাই/বোনের তথ্য দেখা যাবে। অন্যের তথ্য দেখার চেষ্টা করলে আপনার অ্যাক্সেস বন্ধ হয়ে যাবে এবং মাদ্রাসা কর্তৃপক্ষ দায়ী থাকবে না।
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "0.2rem" }}>{label}</div>
      <div style={{ fontWeight: "500", color: "#1a1a1a" }}>{value}</div>
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

const th: React.CSSProperties = { padding: "0.55rem 0.7rem", textAlign: "left", fontWeight: "600", fontSize: "0.75rem", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.55rem 0.7rem", color: "#1a1a1a" };
