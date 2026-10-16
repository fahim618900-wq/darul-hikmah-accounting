import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
import NotificationBell from "./notification-bell";
import ThemeToggle from "./theme-toggle";
import MobileMenu from "./mobile-menu";
import MobileBottomNav from "./mobile-bottom-nav";
import RoutePrefetcher from "./route-prefetcher";
import RoutePrefetcher from "./route-prefetcher";

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
    .select("full_name, role, is_held, held_reason")
    .eq("id", user?.id)
    .single();

  const role = profile?.role || "pending";
  const fullName = profile?.full_name || user?.email || "ব্যবহারকারী";
  const isHeld = profile?.is_held === true;

  if (role === "pending") {
    return <>{children}</>;
  }

  if (isHeld) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-amber-700 mb-3">
            আপনার অ্যাকাউন্ট Hold করা হয়েছে
          </h2>
          <p className="text-slate-600 mb-2">
            আপনার অ্যাকাউন্ট সাময়িকভাবে বন্ধ রাখা হয়েছে।
          </p>
          {profile?.held_reason && (
            <p className="text-slate-500 text-sm mb-4">
              কারণ: {profile.held_reason}
            </p>
          )}
          <p className="text-slate-500 text-sm">
            অনুগ্রহ করে Admin-এর সাথে যোগাযোগ করুন।
          </p>
        </div>
      </div>
    );
  }

  const navLinks = [
  { href: "/dashboard", label: "ড্যাশবোর্ড", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/students", label: "শিক্ষার্থী", roles: ["admin", "accountant"] },
  { href: "/dashboard/fees", label: "বেতন আদায়", roles: ["admin", "accountant"] },
  { href: "/dashboard/fees-status", label: "Paid/Unpaid", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/excel-entry", label: "এক্সেল এন্ট্রি", roles: ["admin", "accountant"] },
  { href: "/dashboard/events", label: "ইভেন্ট ফি", roles: ["admin", "accountant", "viewer"] },
  { href: "/dashboard/income", label: "আয়", roles: ["admin", "accountant"] },
  { href: "/dashboard/expenses", label: "ব্যয়", roles: ["admin", "accountant"] },
  { href: "/dashboard/reports", label: "রিপোর্ট", roles: ["admin", "accountant", "viewer"] },
  { href: "/admin/users", label: "ব্যবহারকারী", roles: ["admin"] },
  { href: "/admin/audit-logs", label: "অডিট লগ", roles: ["admin"] },
  { href: "/admin/closed-months", label: "মাস বন্ধ", roles: ["admin"] },
  { href: "/admin/settings", label: "সেটিংস", roles: ["admin"] },
  { href: "/admin/clear-data", label: "ডেটা মুছুন", roles: ["admin"] },
];

  const visibleLinks = navLinks.filter((link) => link.roles.includes(role));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
    
      {/* ============ ডেস্কটপ হেডার (শুধু lg-এ দেখাবে) ============ */}
      <div className="no-print hidden lg:block">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Darul Hikmah
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                    Model Madrasa
                  </div>
                </div>
              </Link>

              <nav className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/80 p-1 shadow-inner dark:border-slate-700 dark:bg-slate-800/80">
                {visibleLinks.slice(0, 7).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-3.5 py-2 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-white hover:text-teal-800 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-teal-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2 shrink-0">
                <ThemeToggle />
                <NotificationBell userId={user?.id || ""} />
                <div className="flex items-center gap-3 pl-3 ml-1 border-l border-slate-200 dark:border-slate-700">
                  <div className="text-right leading-tight">
                    <div className="text-xs text-slate-400 dark:text-slate-500">Assalamu Alaikum</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{fullName}</div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 flex items-center justify-center font-semibold text-sm">
                    {fullName.charAt(0)}
                  </div>
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {visibleLinks.slice(7).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="whitespace-nowrap rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-teal-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-teal-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* ============ মোবাইল টপ বার (শুধু ছোট আইকন) ============ */}
      <div className="no-print lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              দারুল হিকমাহ
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell userId={user?.id || ""} />
          </div>
        </div>
      </div>

      {/* মূল কনটেন্ট */}
      <div className="pb-24">{children}</div>

      {/* মোবাইল বটম নেভিগেশন (সব পেজে) */}
      <MobileBottomNav role={role} fullName={fullName} />
    </div>
  );
}
