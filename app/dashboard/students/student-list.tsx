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

export default function StudentList({ initialStudents }: { initialStudents: Student[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [loading, setLoading] = useState<number | null>(null);

  const filtered = students.filter((s) => {
    if (classFilter && s.class_name !== classFilter) return false;
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

  return (
    <>
      {showForm && <StudentForm student={editing} onClose={handleFormClose} />}

      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম, আইডি, রোল বা ফোন দিয়ে খুঁজুন..."
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "0.65rem 0.9rem",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "0.95rem",
          }}
        />
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          style={{
            padding: "0.65rem 0.9rem",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "0.95rem",
            minWidth: "150px",
            background: "#ffffff",
          }}
        >
          <option value="">সব শ্রেণি</option>
          {CLASSES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={handleAddNew}
          style={{
            padding: "0.65rem 1.25rem",
            background: "#0f766e",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.95rem",
            fontWeight: "500",
          }}
        >
          + নতুন শিক্ষার্থী
        </button>
      </div>

      {classFilter && (
        <div style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#475569" }}>
          <strong>{classFilter}</strong> শ্রেণিতে <strong>{filtered.length}</strong> জন শিক্ষার্থী
        </div>
      )}

      {filtered.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          {students.length === 0
            ? "এখনো কোনো শিক্ষার্থী যোগ করা হয়নি। উপরে '+ নতুন শিক্ষার্থী' বাটনে ক্লিক করুন।"
            : "কোনো ফলাফল পাওয়া যায়নি।"}
        </div>
      ) : (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <tr>
                  <th style={th}>আইডি</th>
                  <th style={th}>নাম</th>
                  <th style={th}>শ্রেণি</th>
                  <th style={th}>রোল</th>
                  <th style={th}>অভিভাবক</th>
                  <th style={th}>মাসিক বেতন</th>
                  <th style={th}>স্ট্যাটাস</th>
                  <th style={th}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={td}>{s.student_id || "-"}</td>
                    <td style={{ ...td, fontWeight: "500" }}>
                      <Link
                        href={`/dashboard/students/${s.id}`}
                        style={{ color: "#0f766e", textDecoration: "none" }}
                      >
                        {s.name}
                      </Link>
                    </td>
                    <td style={td}>{s.class_name}</td>
                    <td style={td}>{s.roll || "-"}</td>
                    <td style={td}>
                      {s.guardian_name || "-"}
                      {s.guardian_phone && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {s.guardian_phone}
                        </div>
                      )}
                    </td>
                    <td style={td}>৳ {Number(s.monthly_fee || 0).toLocaleString("bn-BD")}</td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          background: s.status === "active" ? "#dcfce7" : "#fee2e2",
                          color: s.status === "active" ? "#15803d" : "#b91c1c",
                        }}
                      >
                        {s.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button onClick={() => handleEdit(s)} style={btnEdit}>
                          সম্পাদনা
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          disabled={loading === s.id}
                          style={btnDelete}
                        >
                          {loading === s.id ? "..." : "ডিলিট"}
                        </button>
                      </div>
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

const th: React.CSSProperties = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  fontWeight: "600",
  color: "#475569",
  fontSize: "0.85rem",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "0.75rem 1rem",
  color: "#1a1a1a",
  verticalAlign: "top",
};

const btnEdit: React.CSSProperties = {
  padding: "0.35rem 0.7rem",
  background: "#ffffff",
  color: "#0f766e",
  border: "1px solid #0f766e",
  borderRadius: "4px",
  fontSize: "0.8rem",
};

const btnDelete: React.CSSProperties = {
  padding: "0.35rem 0.7rem",
  background: "#ffffff",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  borderRadius: "4px",
  fontSize: "0.8rem",
};
