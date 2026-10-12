import { createClient } from "@/lib/supabase/server";
import StudentList from "./student-list";

export default async function StudentsPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("is_deleted", false)
    .order("class_name", { ascending: true })
    .order("roll", { ascending: true });

  const total = students?.length || 0;

  return (
    <main className="students-page">
      <style>{`
        .students-page {
          padding: 1.25rem 0.9rem 2.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .students-header {
          margin-bottom: 1.25rem;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .students-header-left h2 {
          font-size: 1.35rem;
          color: #0f766e;
          margin: 0 0 0.25rem 0;
          line-height: 1.25;
        }
        .students-header-left p {
          color: #64748b;
          font-size: 0.85rem;
          margin: 0;
        }
        .students-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #f0fdfa;
          color: #0f766e;
          border: 1px solid #99f6e4;
          padding: 0.35rem 0.7rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .students-badge svg {
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .students-page {
            padding: 1.75rem 1.25rem 3rem;
          }
          .students-header-left h2 {
            font-size: 1.5rem;
          }
          .students-header-left p {
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className="students-header">
        <div className="students-header-left">
          <h2>শিক্ষার্থী ব্যবস্থাপনা</h2>
          <p>সকল শ্রেণির শিক্ষার্থীদের তালিকা</p>
        </div>

        <span className="students-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          মোট {total} জন
        </span>
      </div>

      <StudentList initialStudents={students || []} />
    </main>
  );
}
