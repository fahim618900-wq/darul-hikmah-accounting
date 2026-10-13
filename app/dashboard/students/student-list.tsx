"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import StudentForm from "./student-form";

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

const CLASSES = [
  "প্লে", "নার্সারি", "প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম",
  "ষষ্ঠ", "সপ্তম", "অষ্টম", "নবম", "দশম", "নূরানী", "নাযেরা", "হিফয",
];

const COLUMN_OPTIONS: { key: string; label: string }[] = [
  { key: "student_id", label: "আইডি" },
  { key: "name", label: "নাম" },
  { key: "class_name", label: "শ্রেণি" },
  { key: "roll", label: "রোল" },
  { key: "guardian_name", label: "অভিভাবকের নাম" },
  { key: "guardian_phone", label: "অভিভাবকের ফোন" },
  { key: "address", label: "ঠিকানা" },
  { key: "monthly_fee", label: "মাসিক বেতন" },
  { key: "discount", label: "ছাড়" },
  { key: "status", label: "স্ট্যাটাস" },
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

export default function StudentList({
  initialStudents,
  userName,
}: {
  initialStudents: Student[];
  userName: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    COLUMN_OPTIONS.map((c) => c.key)
  );
  const [preparedBy, setPreparedBy] = useState(userName);

  const filtered = students.filter((s) => {
    if (classFilter && s.class_name !== classFilter) return false;
    if (statusFilter === "active" && s.status !== "active") return false;
    if (statusFilter === "inactive" && s.status !== "inactive") return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.student_id || "").toLowerCase().includes(q) ||
      (s.roll || "").toLowerCase().includes(q) ||
      (s.guardian_phone || "").includes(q)
    );
  });

  async function handleDelete(student: Student) {
    const confirmed = confirm(
      `"${student.name}" কে স্থায়ীভাবে ডিলিট করতে চান?\n\n` +
        `সতর্কতা: এই শিক্ষার্থীর সব বেতন এন্ট্রি ও রেকর্ড স্থায়ীভাবে মুছে যাবে।\n` +
        `এই কাজটি ফিরিয়ে আনা যাবে না।`
    );
    if (!confirmed) return;

    setLoading(student.id);
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", student.id);

    if (error) {
      alert("সমস্যা: " + error.message);
      setLoading(null);
      return;
    }

    setStudents((prev) => prev.filter((s) => s.id !== student.id));
    setLoading(null);
    router.refresh();
  }

  function handleEdit(student: Student) {
    setEditing(student);
    setShowForm(true);
  }

  function handleAddNew() {
    setEditing(null);
    setShowForm(true);
  }

  function handleFormClose(refresh: boolean) {
    setShowForm(false);
    setEditing(null);
    if (refresh) router.refresh();
  }

  function toggleColumn(key: string) {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handlePrint() {
    window.print();
  }

  function formatValue(s: Student, key: string): string {
    switch (key) {
      case "student_id": return s.student_id || "-";
      case "name": return s.name;
      case "class_name": return s.class_name + (s.section ? ` (${s.section})` : "");
      case "roll": return s.roll || "-";
      case "guardian_name": return s.guardian_name || "-";
      case "guardian_phone": return s.guardian_phone || "-";
      case "address": return s.address || "-";
      case "monthly_fee": return `৳ ${toBangla(s.monthly_fee)}`;
      case "discount": return `৳ ${toBangla(s.discount || 0)}`;
      case "status": return s.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়";
      default: return "-";
    }
  }

  const visibleColumns = COLUMN_OPTIONS.filter((c) => selectedColumns.includes(c.key));

  return (
    <>
      {showForm && <StudentForm student={editing} onClose={handleFormClose} />}

      {/* স্ক্রিনে ফিল্টার */}
      <div className="no-print" style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম, আইডি, রোল বা ফোন দিয়ে খুঁজুন..."
          style={{ flex: 1, minWidth: "200px", padding: "0.65rem 0.9rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.95rem" }}
        />
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          style={{ padding: "0.65rem 0.9rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.95rem", minWidth: "140px", background: "#ffffff" }}
        >
          <option value="">সব শ্রেণি</option>
          {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          style={{ padding: "0.65rem 0.9rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.95rem", minWidth: "130px", background: "#ffffff" }}
        >
          <option value="all">সব স্ট্যাটাস</option>
          <option value="active">সক্রিয়</option>
          <option value="inactive">নিষ্ক্রিয়</option>
        </select>
        <button
          onClick={() => setShowPrintOptions(!showPrintOptions)}
          style={{ padding: "0.65rem 1rem", background: "#ffffff", color: "#0f766e", border: "1px solid #0f766e", borderRadius: "6px", fontSize: "0.9rem", fontWeight: "500" }}
        >
          🖨️ Print / PDF
        </button>
        <button
          onClick={handleAddNew}
          style={{ padding: "0.65rem 1.25rem", background: "#0f766e", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "0.95rem", fontWeight: "500" }}
        >
          + নতুন শিক্ষার্থী
        </button>
      </div>

      {/* প্রিন্ট অপশন */}
      {showPrintOptions && (
        <div className="no-print" style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderLeft: "4px solid #0f766e" }}>
          <div style={{ marginBottom: "0.75rem", fontSize: "0.9rem", color: "#475569", fontWeight: "500" }}>
            কোন কোন কলাম প্রিন্টে দেখাতে চান?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {COLUMN_OPTIONS.map((c) => (
              <label
                key={c.key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.35rem 0.7rem",
                  background: selectedColumns.includes(c.key) ? "#f0fdf4" : "#f8fafc",
                  border: selectedColumns.includes(c.key) ? "1px solid #0f766e" : "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  color: selectedColumns.includes(c.key) ? "#0f766e" : "#475569",
                  fontWeight: selectedColumns.includes(c.key) ? "500" : "400",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(c.key)}
                  onChange={() => toggleColumn(c.key)}
                  style={{ accentColor: "#0f766e" }}
                />
                {c.label}
              </label>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", color: "#475569", fontWeight: "500" }}>
                প্রস্তুতকারীর নাম
              </label>
              <input
                type="text"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handlePrint}
              style={{ padding: "0.55rem 1.1rem", background: "#0f766e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.88rem", fontWeight: "500" }}
            >
              🖨️ Print / PDF করুন
            </button>
            <button
              onClick={() => setShowPrintOptions(false)}
              style={{ padding: "0.55rem 1.1rem", background: "#ffffff", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.88rem" }}
            >
              বাতিল
            </button>
          </div>
        </div>
      )}

      {classFilter && (
        <div className="no-print" style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#475569" }}>
          <strong>{classFilter}</strong> শ্রেণিতে <strong>{filtered.length}</strong> জন শিক্ষার্থী
        </div>
      )}

      {/* প্রিন্ট হেডার */}
      <div className="print-area">
        <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "8px 8px 0 0", borderBottom: "2px solid #0f766e" }}>
          <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            <h1 style={{ fontSize: "1.4rem", color: "#0f766e", marginBottom: "0.25rem" }}>
              দারুল হিকমাহ মডেল মাদ্রাসা
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              ইসলামী ব্যাংকের বিপরীত পার্শ্বে, ফুলপুর, ময়মনসিংহ
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem", marginBottom: "0.35rem" }}>
            <div>
              <strong>বিষয়:</strong> শিক্ষার্থী তালিকা
              {classFilter && ` — ${classFilter} শ্রেণি`}
              {statusFilter === "active" && " (সক্রিয়)"}
              {statusFilter === "inactive" && " (নিষ্ক্রিয়)"}
            </div>
            <div><strong>তারিখ:</strong> {todayBangla()}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem" }}>
            <div><strong>মোট শিক্ষার্থী:</strong> {toBangla(filtered.length)} জন</div>
            <div><strong>প্রস্তুতকারী:</strong> {preparedBy || "_______________"}</div>
          </div>
        </div>

        {/* তালিকা */}
        {filtered.length === 0 ? (
          <div style={{ background: "#ffffff", padding: "2rem", textAlign: "center", color: "#64748b" }}>
            {students.length === 0
              ? "এখনো কোনো শিক্ষার্থী যোগ করা হয়নি।"
              : "কোনো ফলাফল পাওয়া যায়নি।"}
          </div>
        ) : (
          <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ background: "#0f766e", color: "#ffffff" }}>
                <th style={th}>নং</th>
                {visibleColumns.map((c) => (
                  <th key={c.key} style={th}>{c.label}</th>
                ))}
                <th className="no-print" style={th}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={td}>{toBangla(i + 1)}</td>
                  {visibleColumns.map((c) => (
                    <td key={c.key} style={c.key === "name" ? { ...td, fontWeight: "500" } : td}>
                      {c.key === "name" ? (
                        <Link
                          href={`/dashboard/students/${s.id}`}
                          className="no-print"
                          style={{ color: "#0f766e", textDecoration: "none" }}
                        >
                          {s.name}
                        </Link>
                      ) : (
                        formatValue(s, c.key)
                      )}
                      {c.key === "name" && (
                        <span style={{ display: "none" }} className="print-only-inline">
                          {s.name}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="no-print" style={td}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button onClick={() => handleEdit(s)} style={btnEdit}>সম্পাদনা</button>
                      <button onClick={() => handleDelete(s)} disabled={loading === s.id} style={btnDelete}>
                        {loading === s.id ? "..." : "ডিলিট"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

const th: React.CSSProperties = { padding: "0.65rem 0.7rem", textAlign: "left", fontWeight: "600", fontSize: "0.75rem", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "0.65rem 0.7rem", color: "#1a1a1a" };
const btnEdit: React.CSSProperties = { padding: "0.3rem 0.6rem", background: "#ffffff", color: "#0f766e", border: "1px solid #0f766e", borderRadius: "4px", fontSize: "0.78rem" };
const btnDelete: React.CSSProperties = { padding: "0.3rem 0.6rem", background: "#ffffff", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: "4px", fontSize: "0.78rem" };
