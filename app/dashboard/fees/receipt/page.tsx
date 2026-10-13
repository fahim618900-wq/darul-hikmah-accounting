import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReceiptPage from "./receipt-page";

export default async function ReceiptMainPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!searchParams.id) {
    redirect("/dashboard/fees");
  }

  const { data: payment } = await supabase
    .from("fee_payments")
    .select("*")
    .eq("id", searchParams.id)
    .single();

  if (!payment) {
    redirect("/dashboard/fees");
  }

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", payment.student_id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <ReceiptPage
      payment={payment}
      student={student}
      userName={profile?.full_name || user.email || ""}
    />
  );
}
