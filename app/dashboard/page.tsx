import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Profile read error:", error);
  }

  const role = profile?.role || "pending";
  const fullName = profile?.full_name || user.email || "ব্যবহারকারী";

  if (role === "pending") {
    return (
      <main className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", background: "#ffffff", padding: "2rem", borderRadius: "8px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h1 style={{ fontSize: "1.5rem", color: "#d97706", marginBottom: "1rem" }}>
            অনুমোদনের অপেক্ষায়
          </h1>
          <p style={{ color: "#475569", marginBottom: "1rem" }}>
            আসসালামু আলাইকুম, {fullName}।
          </p>
          <p style={{ color: "#475569", marginBottom: "1rem" }}>
            আপনার ইমেইল যাচাই সম্পন্ন হয়েছে। এখন Admin অনুমোদন দিলে আপনি সিস্টেমে ঢুকতে পারবেন।
          </p>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            অনুগ্রহ করে অপেক্ষা করুন অথবা Admin-এর সাথে যোগাযোগ করুন।
          </p>
          <LogoutButton />
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "0.25rem" }}>
            দারুল হিকমাহ মডেল মাদ্রাসা
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            আসসালামু আলাইকুম, {fullName}
          </p>
        </div>
        <LogoutButton />
      </div>

      <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#0f766e" }}>
          ড্যাশবোর্ড
        </h2>
        <p style={{ color: "#475569", marginBottom: "0.5rem" }}>
          আপনার Role: <strong>{role}</strong>
        </p>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          শীঘ্রই এখানে আয়-ব্যয় এন্ট্রি, শিক্ষার্থী ব্যবস্থাপনা ও রিপোর্ট যোগ করা হবে।
        </p>
      </div>
    </main>
  );
}
