"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  "প্লে",
  "নার্সারি",
  "প্রথম",
  "দ্বিতীয়",
  "তৃতীয়",
  "চতুর্থ",
  "পঞ্চম",
  "ষষ্ঠ",
  "সপ্তম",
  "অষ্টম",
  "নবম",
  "দশম",
  "নূরানী",
  "নাযেরা",
  "হিফয",
];

// --- SVG Icons ---
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

const EmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="17" y1="8" x2="22" y2="13" />
    <line x1="22" y1="8" x2="17" y2="13" />
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export default function StudentList({ initialStudents }: { initialStudents: Student[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [loading, setLoading] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (classFilter && s.class_name !== classFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.student_id || "").toLowerCase().includes(q) ||
        (s.roll || "").toLowerCase().includes(q) ||
        (s.guardian_phone || "").includes(q) ||
        s.class_name.toLowerCase().includes(q)
      );
    });
  }, [students, search, classFilter]);

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

  function clearFilters() {
    setSearch("");
    setClassFilter("");
  }

  const hasFilter = search || classFilter;

  return (
    <>
      <style>{`
        .sl-toolbar {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          margin-bottom: 0.9rem;
        }
        .sl-row {
          display: flex;
          gap: 0.55rem;
        }
        .sl-search {
          position: relative;
          flex: 1;
        }
        .sl-search input {
          width: 100%;
          padding: 0.6rem 0.85rem 0.6rem 2.25rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.9rem;
          background: #ffffff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .sl-search input:focus {
          border-color: #0f766e;
          box-shadow: 0 0 0 3px rgba(15,118,110,0.12);
        }
        .sl-search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          display: flex;
        }
        .sl-select {
          padding: 0.6rem 2rem 0.6rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.88rem;
          background: #ffffff url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>") no-repeat right 0.7rem center;
          appearance: none;
          -webkit-appearance: none;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
          color: #0f172a;
          cursor: pointer;
          min-width: 140px;
        }
        .sl-select:focus {
          border-color: #0f766e;
          box-shadow: 0 0 0 3px rgba(15,118,110,0.12);
        }
        .sl-add-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.6rem 1rem;
          background: #0f766e;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.08s;
          white-space: nowrap;
          font-family: inherit;
        }
        .sl-add-btn:hover { background: #0d5f59; }
        .sl-add-btn:active { transform: scale(0.98); }

        .sl-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem;
          margin-bottom: 0.9rem;
          padding: 0.55rem 0.85rem;
          background: #f0fdfa;
          border: 1px solid #99f6e4;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #0f766e;
        }
        .sl-filter-bar > div {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }
        .sl-filter-bar strong { font-weight: 700; }
        .sl-clear-btn {
          background: transparent;
          border: none;
          color: #0f766e;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.2rem 0.5rem;
          border-radius: 5px;
          text-decoration: underline;
          font-family: inherit;
        }
        .sl-clear-btn:hover { background: #ccfbf1; }

        .sl-empty {
          background: #ffffff;
          padding: 2.25rem 1.25rem;
          border-radius: 12px;
          text-align: center;
          color: #64748b;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          font-size: 0.9rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .sl-card {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.07);
          border: 1px solid #f1f5f9;
        }

        /* ---- Desktop table ---- */
        .sl-table-wrap { overflow-x: auto; }
        .sl-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .sl-table thead {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .sl-table th {
          padding: 0.7rem 0.9rem;
          text-align: left;
          font-weight: 600;
          color: #475569;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .sl-table td {
          padding: 0.75rem 0.9rem;
          color: #1a1a1a;
          vertical-align: middle;
          border-bottom: 1px solid #f1f5f9;
        }
        .sl-table tbody tr:last-child td { border-bottom: none; }
        .sl-table tbody tr:hover { background: #fafcfb; }
        .sl-name { font-weight: 600; color: #0f172a; }
        .sl-sub { font-size: 0.72rem; color: #64748b; margin-top: 2px; }

        .sl-status {
          display: inline-block;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .sl-status.active { background: #dcfce7; color: #15803d; }
        .sl-status.inactive { background: #fee2e2; color: #b91c1c; }

        .sl-actions { display: flex; gap: 0.35rem; }
        .sl-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.32rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s;
          background: #ffffff;
          line-height: 1;
          font-family: inherit;
        }
        .sl-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .sl-btn-edit { color: #0f766e; border: 1px solid #99f6e4; }
        .sl-btn-edit:hover { background: #f0fdfa; }
        .sl-btn-delete { color: #b91c1c; border: 1px solid #fecaca; }
        .sl-btn-delete:hover { background: #fef2f2; }

        /* ---- Mobile cards ---- */
        .sl-cards { display: none; }
        .sl-mcard {
          padding: 0.9rem 1rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .sl-mcard:last-child { border-bottom: none; }
        .sl-mcard-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.55rem;
        }
        .sl-mcard-title {
          font-weight: 600;
          color: #0f172a;
          font-size: 0.95rem;
          line-height: 1.3;
        }
        .sl-mcard-id {
          font-size: 0.72rem;
          color: #64748b;
          margin-top: 2px;
        }
        .sl-mcard-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.45rem 0.75rem;
          font-size: 0.78rem;
          margin-bottom: 0.65rem;
        }
        .sl-mcard-meta span { color: #64748b; }
        .sl-mcard-meta b { color: #1a1a1a; font-weight: 500; }
        .sl-mcard-actions {
          display: flex;
          gap: 0.4rem;
        }
        .sl-mcard-actions .sl-btn {
          flex: 1;
          justify-content: center;
          padding: 0.5rem 0.65rem;
          font-size: 0.8rem;
        }

        /* Responsive */
        @media (min-width: 640px) {
          .sl-toolbar {
            flex-direction: row;
            align-items: center;
            margin-bottom: 1rem;
          }
          .sl-row { flex: 1; }
          .sl-add-btn { padding: 0.6rem 1.15rem; }
        }

        @media (max-width: 720px) {
          .sl-table-wrap { display: none; }
          .sl-cards { display: block; }
        }
      `}</style>

      {showForm && <StudentForm student={editing} onClose={handleFormClose} />}

      <div className="sl-toolbar">
        <div className="sl-row">
          <div className="sl-search">
            <span className="sl-search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম, আইডি, রোল বা ফোন..."
            />
          </div>
          <select
            className="sl-select"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">সব শ্রেণি</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button className="sl-add-btn" onClick={handleAddNew}>
          <PlusIcon />
          নতুন শিক্ষার্থী
        </button>
      </div>

      {hasFilter && filtered.length > 0 && (
        <div className="sl-filter-bar">
          <div>
            <FilterIcon />
            {classFilter && (
              <span>
                <strong>{classFilter}</strong> শ্রেণি
              </span>
            )}
            {classFilter && search && <span>·</span>}
            {search && (
              <span>
                খোঁজ: <strong>"{search}"</strong>
              </span>
            )}
            <span>·</span>
            <span>
              <strong>{filtered.length}</strong> জন পাওয়া গেছে
            </span>
          </div>
          <button className="sl-clear-btn" onClick={clearFilters}>
            ফিল্টার মুছুন
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="sl-empty">
          <EmptyIcon />
          <span>
            {students.length === 0
              ? "এখনো কোনো শিক্ষার্থী যোগ করা হয়নি। উপরে '+ নতুন শিক্ষার্থী' বাটনে ক্লিক করুন।"
              : "কোনো ফলাফল পাওয়া যায়নি। ফিল্টার পরিবর্তন করে দেখুন।"}
          </span>
        </div>
      ) : (
        <div className="sl-card">
          {/* Desktop table */}
          <div className="sl-table-wrap">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>আইডি</th>
                  <th>নাম</th>
                  <th>শ্রেণি</th>
                  <th>রোল</th>
                  <th>অভিভাবক</th>
                  <th>মাসিক বেতন</th>
                  <th>স্ট্যাটাস</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>{s.student_id || "-"}</td>
                    <td className="sl-name">{s.name}</td>
                    <td>{s.class_name}</td>
                    <td>{s.roll || "-"}</td>
                    <td>
                      {s.guardian_name || "-"}
                      {s.guardian_phone && <div className="sl-sub">{s.guardian_phone}</div>}
                    </td>
                    <td>৳ {Number(s.monthly_fee || 0).toLocaleString("bn-BD")}</td>
                    <td>
                      <span className={`sl-status ${s.status === "active" ? "active" : "inactive"}`}>
                        {s.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </td>
                    <td>
                      <div className="sl-actions">
                        <button className="sl-btn sl-btn-edit" onClick={() => handleEdit(s)}>
                          <EditIcon />
                          সম্পাদনা
                        </button>
                        <button
                          className="sl-btn sl-btn-delete"
                          onClick={() => handleDelete(s)}
                          disabled={loading === s.id}
                        >
                          <TrashIcon />
                          {loading === s.id ? "..." : "ডিলিট"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sl-cards">
            {filtered.map((s) => (
              <div key={s.id} className="sl-mcard">
                <div className="sl-mcard-head">
                  <div>
                    <div className="sl-mcard-title">{s.name}</div>
                    <div className="sl-mcard-id">
                      {s.student_id ? `আইডি: ${s.student_id}` : "আইডি নেই"}
                    </div>
                  </div>
                  <span className={`sl-status ${s.status === "active" ? "active" : "inactive"}`}>
                    {s.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </span>
                </div>

                <div className="sl-mcard-meta">
                  <div><span>শ্রেণি:</span> <b>{s.class_name}</b></div>
                  <div><span>রোল:</span> <b>{s.roll || "-"}</b></div>
                  <div><span>বেতন:</span> <b>৳ {Number(s.monthly_fee || 0).toLocaleString("bn-BD")}</b></div>
                  <div><span>অভিভাবক:</span> <b>{s.guardian_name || "-"}</b></div>
                </div>

                {s.guardian_phone && (
                  <div className="sl-sub" style={{ marginBottom: "0.6rem" }}>
                    📞 {s.guardian_phone}
                  </div>
                )}

                <div className="sl-mcard-actions">
                  <button className="sl-btn sl-btn-edit" onClick={() => handleEdit(s)}>
                    <EditIcon />
                    সম্পাদনা
                  </button>
                  <button
                    className="sl-btn sl-btn-delete"
                    onClick={() => handleDelete(s)}
                    disabled={loading === s.id}
                  >
                    <TrashIcon />
                    {loading === s.id ? "..." : "ডিলিট"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
