import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PaymentClient from "./payment-client";

export default async function PaymentPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!student) {
    notFound();
  }

  // এই মাসে ইতিমধ্যে কত পরিশোধিত
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: existingPayments } = await supabase
    .from("fee_payments")
    .select("amount, month, year, payment_date, receipt_no")
    .eq("student_id", params.id)
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .order("payment_date", { ascending: false });

  const paidThisMonth = (existingPayments || []).reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  return (
    <PaymentClient
      student={student}
      currentMonth={currentMonth}
      currentYear={currentYear}
      paidThisMonth={paidThisMonth}
      existingPayments={existingPayments || []}
    />
  );
}
