import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentProfile from "./student-profile";

export default async function StudentProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!student) {
    notFound();
  }

  const { data: payments } = await supabase
    .from("fee_payments")
    .select("*")
    .eq("student_id", params.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <StudentProfile student={student} payments={payments || []} />
    </main>
  );
}
