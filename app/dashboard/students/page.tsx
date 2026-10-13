import { createClient } from "@/lib/supabase/server";
import StudentList from "./student-list";

export default async function StudentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id)
    .single();

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .order("class_name", { ascending: true })
    .order("roll", { ascending: true });

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <StudentList
        initialStudents={students || []}
        userName={profile?.full_name || user?.email || ""}
      />
    </main>
  );
}
