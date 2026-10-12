import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClearDataClient from "./clear-data-client";

export default async function ClearDataPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 style={{ fontSize: "1.5rem", color: "#b91c1c", marginBottom: "0.5rem" }}>
        সব ডেটা মুছুন
      </h2>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>
        ⚠️ বিপজ্জনক এলাকা। এখান থেকে সব ডেমো ডেটা মুছে ফেলা যাবে।
      </p>
      <ClearDataClient />
    </main>
  );
}
