import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EventsClient from "./events-client";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name,role").eq("id", user.id).single();
  const role = profile?.role || "pending";
  if (!["admin","accountant","viewer"].includes(role)) redirect("/dashboard");
  const [{ data: students }, { data: events }, { data: assignments }, { data: payments }] = await Promise.all([
    supabase.from("students").select("id,name,class_name,roll,student_id").eq("status","active").or("is_deleted.eq.false,is_deleted.is.null").is("deleted_at",null).order("class_name").order("roll"),
    supabase.from("madrasah_events").select("*").order("created_at",{ascending:false}),
    supabase.from("event_student_fees").select("id,event_id,student_id,payable_amount"),
    supabase.from("event_payments").select("id,event_id,student_id,amount,payment_date,receipt_no,is_deleted").eq("is_deleted",false).order("created_at",{ascending:false}),
  ]);
  return <EventsClient students={students || []} initialEvents={events || []} initialAssignments={assignments || []} initialPayments={payments || []} userName={profile?.full_name || user.email || ""} canManage={role==="admin" || role==="accountant"} />;
}
