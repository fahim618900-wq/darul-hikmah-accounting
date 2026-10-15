import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserApprovalList from "./user-approval-list";

export default async function AdminUsersPage({ searchParams }: { searchParams: { highlight?: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (myProfile?.role !== "admin") redirect("/dashboard");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at, is_held, held_at, held_reason")
    .order("created_at", { ascending: false });

  return (
    <main className="container mx-auto px-3 sm:px-4 py-5">
      <div className="max-w-6xl mx-auto mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          ব্যবহারকারী ব্যবস্থাপনা
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Role পরিবর্তন করুন, Hold করুন বা অনুমোদন দিন
        </p>
      </div>

      <UserApprovalList initialProfiles={profiles || []} currentUserId={user.id}
        highlight={searchParams.highlight || ""} />
    </main>
  );
}
