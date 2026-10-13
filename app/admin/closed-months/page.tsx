import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClosedMonthsClient from "./closed-months-client";

export default async function ClosedMonthsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: closedMonths } = await supabase
    .from("closed_months")
    .select("*")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "0.25rem" }}>
        মাস বন্ধ / লক
      </h2>
      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        মাস বন্ধ করলে সেই মাসের সব আয়-ব্যয়-বেতন লক হয়ে যাবে। আর কেউ পরিবর্তন করতে পারবে না।
      </p>

      <ClosedMonthsClient
        closedMonths={closedMonths || []}
        userName={profile?.full_name || user.email || ""}
      />
    </main>
  );
}
