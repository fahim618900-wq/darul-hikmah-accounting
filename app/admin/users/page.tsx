import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserApprovalList from "./user-approval-list";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (myProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h1 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "0.5rem" }}>
        ব্যবহারকারী ব্যবস্থাপনা
      </h1>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>
        নতুন ব্যবহারকারীদের অনুমোদন দিন এবং Role নির্ধারণ করুন।
      </p>

      <UserApprovalList initialProfiles={profiles || []} currentUserId={user.id} />
    </main>
  );
}
