import { createClient } from "@/lib/supabase/server";
import StudentList from "./student-list";

export default async function StudentsPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .order("class_name", { ascending: true })
    .order("roll", { ascending: true });

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "0.25rem" }}>
          শিক্ষার্থী ব্যবস্থাপনা
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          মোট {students?.length || 0} জন শিক্ষার্থী
        </p>
      </div>

      <StudentList initialStudents={students || []} />
    </main>
  );
}
