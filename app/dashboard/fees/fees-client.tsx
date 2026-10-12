"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: number;
  name: string;
  class_name: string;
  roll: string | null;
  monthly_fee: number;
  discount: number;
};

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

export default function FeesClient({ students }: { students: Student[] }) {
  const router = useRouter();
  const supabase = createClient();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [classFilter, setClassFilter] = useState("");
  const filteredStudents = classFilter
    ? students.filter((s) => s.class_name === classFilter)
    : students;

  const classes = Array.from(new Set(students.map((s) => s.class_name)));

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;

    setLoading(true);
    setMessage("");

    // রসিদ নম্বর তৈরি
    const receiptNo = `R-${year}${String(month).padStart(2, "0")}-${Date.now().toString().slice(-6)}`;

    const { error } = await supabase.from("fee_payments").insert({
      student_id: selectedStudent.id,
      month,
      year,
      amount: Number(amount),
      payment_method: paymentMethod,
      receipt_no: receiptNo,
      note,
    });

    if (error) {
      setMessage("সমস্যা: " + error.message);
      setLoading(false);
      return;
    }

    setMessage(`সফল! রসিদ নম্বর: ${receiptNo}`);
    setAmount("");
    setNote("");
    setSelectedStudent(null);
    setLoading(false);
    router.refresh();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
      {/* বাম দিকে: শিক্ষার্থী নির্বাচন */}
      <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#0f766e" }}>
          শিক্ষার্থী নির্বাচন
        </h3>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          style={{ ...input, marginBottom: "0.75rem" }}
        >
          <option value="">সব শ্রেণি</option>
          {classes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
          {filteredStudents.length === 0 ? (
            <div style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.9rem" }}>
              কোনো শিক্ষার্থী নেই
            </div>
          ) : (
            filteredStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.9rem",
                  textAlign: "left",
                  background: selectedStudent?.id === s.id ? "#0f766e" : "#ffffff",
                  color: selectedStudent?.id === s.id ? "#ffffff" : "#1a1a1a",
                  border: "none",
                  borderBottom: "1px solid #f1f5f9",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                <div style={{ fontWeight: "500" }}>{s.name}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                  {s.class_name} | রোল: {s.roll || "-"} | বেতন: ৳{s.monthly_fee - (s.discount || 0)}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ডান দিকে: পেমেন্ট ফর্ম */}
      <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#0f766e" }}>
          বেতন এন্ট্রি
        </h3>

        {selectedStudent ? (
          <form onSubmit={handlePayment}>
            <div style={{ background: "#f0fdf4", padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem", border: "1px solid #bbf7d0" }}>
              <div style={{ fontWeight: "500", color: "#15803d" }}>{selectedStudent.name}</div>
              <div style={{ fontSize: "0.8rem", color: "#15803d" }}>
                {selectedStudent.class_name} | প্রাপ্য: ৳{selectedStudent.monthly_fee - (selectedStudent.discount || 0)}
              </div>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={label}>মাস</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={input}>
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={label}>বছর</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={input}
                min={2020}
                max={2100}
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={label}>পরিমাণ (৳) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min={1}
                style={input}
                placeholder={String(selectedStudent.monthly_fee - (selectedStudent.discount || 0))}
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={label}>পেমেন্ট পদ্ধতি</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={input}>
                <option value="cash">নগদ</option>
                <option value="bkash">বিকাশ</option>
                <option value="nagad">নগদ (Nagad)</option>
                <option value="bank">ব্যাংক</option>
                <option value="other">অন্যান্য</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={label}>নোট (ঐচ্ছিক)</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} style={input} />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#0f766e",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontWeight: "500",
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "সংরক্ষণ হচ্ছে..." : "বেতন আদায় করুন"}
            </button>

            {message && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  background: message.startsWith("সফল") ? "#dcfce7" : "#fef2f2",
                  color: message.startsWith("সফল") ? "#15803d" : "#b91c1c",
                }}
              >
                {message}
              </div>
            )}
          </form>
        ) : (
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            বাম দিক থেকে একজন শিক্ষার্থী নির্বাচন করুন।
          </p>
        )}
      </div>
    </div>
  );
}

const label: React.CSSProperties = {
  display: "block",
  marginBottom: "0.35rem",
  fontSize: "0.85rem",
  color: "#475569",
  fontWeight: "500",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "0.9rem",
  fontFamily: "inherit",
};
