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
    <section className="space-y-5">
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        মাস বন্ধ / লক
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
        মাস বন্ধ করলে সেই মাসের সব আয়-ব্যয়-বেতন লক হয়ে যাবে। আর কেউ পরিবর্তন করতে পারবে না।
      </p>

      <ClosedMonthsClient
        closedMonths={closedMonths || []}
        userName={profile?.full_name || user.email || ""}
      />
    </section>
  );
}
