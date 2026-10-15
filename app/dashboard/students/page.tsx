import { createClient } from "@/lib/supabase/server";
import StudentList from "./student-list";

export default async function StudentsPage({ searchParams }: { searchParams: { highlight?: string; month?: string; year?: string } }) {
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
        highlight={searchParams.highlight || ""}
        highlightMonth={searchParams.month ? Number(searchParams.month) : undefined}
        highlightYear={searchParams.year ? Number(searchParams.year) : undefined}
      />
    </main>
  );
}
