import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user?.id)
    .single();

  const role = profile?.role || "pending";

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h2 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "1.5rem" }}>
        ড্যাশবোর্ড
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "0.5rem" }}>আপনার Role</p>
          <p style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f766e" }}>{role}</p>
        </div>
      </div>

      <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
          উপরের মেনু থেকে আয়, ব্যয়, শিক্ষার্থী, রিপোর্ট ইত্যাদি পেজে যেতে পারবেন।
        </p>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "1rem" }}>
          শীঘ্রই এখানে মোট আয়, মোট ব্যয় ও ব্যালেন্স দেখা যাবে।
        </p>
      </div>
    </main>
  );
}
