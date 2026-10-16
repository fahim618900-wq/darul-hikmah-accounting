import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EventsClient from "./events-client";

export default async function EventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "accountant", "viewer"].includes(profile.role)) {
    redirect("/dashboard");
  }

  const { data: events } = await supabase
    .from("madrasah_events")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: eventFees } = await supabase
    .from("event_student_fees")
    .select("*, students(id, name, class_name, roll, section, photo_url, guardian_phone)")
    .order("created_at", { ascending: false });

  const { data: eventPayments } = await supabase
    .from("event_payments")
    .select("*")
    .order("payment_date", { ascending: false });

  const { data: students } = await supabase
    .from("students")
    .select("id, name, class_name, section, roll, photo_url")
    .eq("status", "active")
    .order("class_name")
    .order("roll");

  const classes = Array.from(new Set((students || []).map((s) => s.class_name)));

  return (
    <EventsClient
      initialEvents={events || []}
      initialEventFees={eventFees || []}
      initialEventPayments={eventPayments || []}
      students={students || []}
      classes={classes}
      role={profile.role}
      userName={profile.full_name || user.email || ""}
    />
  );
}
