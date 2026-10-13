import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  const fullName = profile?.full_name || user?.email || "ব্যবহারকারী";

  if (role === "pending") {
    return <>{children}</>;
  }

  const navLinks = [
    { href: "/dashboard", label: "ড্যাশবোর্ড", roles: ["admin", "accountant", "viewer"] },
    { href: "/dashboard/students", label: "শিক্ষার্থী", roles: ["admin", "accountant"] },
    { href: "/dashboard/fees", label: "বেতন আদায়", roles: ["admin", "accountant"] },
    { href: "/dashboard/fees-status", label: "Paid/Unpaid", roles: ["admin", "accountant", "viewer"] },
    { href: "/dashboard/income", label: "আয়", roles: ["admin", "accountant"] },
    { href: "/dashboard/expenses", label: "ব্যয়", roles: ["admin", "accountant"] },
    { href: "/dashboard/reports", label: "রিপোর্ট", roles: ["admin", "accountant", "viewer"] },
    { href: "/admin/users", label: "ব্যবহারকারী", roles: ["admin"] },
    { href: "/admin/clear-data", label: "ডেটা মুছুন", roles: ["admin"] },
  ];

  const visibleLinks = navLinks.filter((link) => link.roles.includes(role));

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <div className="no-print">
        <header style={{ background: "#0f766e", color: "#ffffff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <div className="container" style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>
                  দারুল হিকমাহ মডেল মাদ্রাসা
                </h1>
                <p style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                  আসসালামু আলাইকুম, {fullName}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>

          <nav style={{ background: "#0d5d56", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="container">
              <div style={{ display: "flex", gap: "0.25rem", overflowX: "auto", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      padding: "0.5rem 1rem",
                      color: "#ffffff",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      whiteSpace: "nowrap",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </header>
      </div>

      {children}
    </div>
  );
}
