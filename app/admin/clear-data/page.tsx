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
    <section className="space-y-5">
      <h2 className="text-2xl font-extrabold tracking-tight text-red-700 dark:text-red-400 sm:text-3xl">
        সব ডেটা মুছুন
      </h2>
      <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
        ⚠️ বিপজ্জনক এলাকা। এখান থেকে সব ডেমো ডেটা মুছে ফেলা যাবে।
      </p>
      <ClearDataClient />
    </section>
  );
}
