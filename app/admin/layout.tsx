import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const links = [
  { href: "/dashboard", label: "ড্যাশবোর্ড", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/students", label: "শিক্ষার্থী", roles: ["admin", "accountant"] },
  { href: "/dashboard/fees", label: "বেতন আদায়", roles: ["admin", "accountant"] },
  { href: "/dashboard/fees-status", label: "Paid / Unpaid", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/income", label: "আয়", roles: ["admin", "accountant"] },
  { href: "/dashboard/expenses", label: "ব্যয়", roles: ["admin", "accountant"] },
  { href: "/dashboard/reports", label: "রিপোর্ট", roles: ["admin", "accountant", "viewer"] },
  { href: "/admin/users", label: "ব্যবহারকারী", roles: ["admin"] },
  { href: "/admin/audit-logs", label: "অডিট লগ", roles: ["admin"] },
  { href: "/admin/closed-months", label: "মাস বন্ধ", roles: ["admin"] },
  { href: "/admin/settings", label: "সেটিংস", roles: ["admin"] },
  { href: "/admin/clear-data", label: "ডেটা মুছুন", roles: ["admin"] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const visibleLinks = links.filter((item) => item.roles.includes(profile?.role || ""));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-5">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" strokeLinejoin="round" />
                <path d="M8 7h8M8 11h6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold text-slate-900 dark:text-white">দারুল হিকমাহ</span>
              <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">মডেল মাদ্রাসা · ব্যবস্থাপনা</span>
            </span>
          </Link>
          <div className="hidden text-right sm:block">
            <p className="text-xs text-slate-500 dark:text-slate-400">আসসালামু আলাইকুম</p>
            <p className="max-w-52 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{profile?.full_name || user.email || "ব্যবহারকারী"}</p>
          </div>
        </div>
        <nav aria-label="প্রধান নেভিগেশন" className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-3 sm:px-5">
          {visibleLinks.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-800 dark:hover:bg-teal-950/40 dark:hover:text-teal-300 sm:text-sm">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-8">{children}</main>
    </div>
  );
}
