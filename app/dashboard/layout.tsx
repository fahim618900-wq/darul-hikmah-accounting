import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
import NotificationBell from "./notification-bell";
import ThemeToggle from "./theme-toggle";
import MobileMenu from "./mobile-menu";
import NavLink from "./nav-link";

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

  /* ============ Hold অবস্থা ============ */
  if (isHeld) {
    return (
      <div className="layout-hold-wrapper">
        <div className="layout-hold-card">
          <div className="layout-hold-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="layout-hold-title">
            আপনার অ্যাকাউন্ট Hold করা হয়েছে
          </h2>
          <p className="layout-hold-text">
            আপনার অ্যাকাউন্ট সাময়িকভাবে বন্ধ রাখা হয়েছে।
          </p>
          {profile?.held_reason && (
            <p className="layout-hold-reason">কারণ: {profile.held_reason}</p>
          )}
          <p className="layout-hold-hint">
            অনুগ্রহ করে Admin-এর সাথে যোগাযোগ করুন।
          </p>
        </div>
      </div>
    );
  }

  /* ============ নেভিগেশন লিংক ============ */
  const navLinks = [
    {
      href: "/dashboard",
      label: "ড্যাশবোর্ড",
      roles: ["admin", "accountant", "viewer"],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      ),
    },
    {
      href: "/dashboard/students",
      label: "শিক্ষার্থী",
      roles: ["admin", "accountant"],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      href: "/dashboard/fees",
      label: "বেতন আদায়",
      roles: ["admin", "accountant"],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 12 h .01" />
          <path d="M18 12 h .01" />
        </svg>
      ),
    },
    {
      href: "/dashboard/fees-status",
      label: "Paid/Unpaid",
      roles: ["admin", "accountant", "viewer"],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      href: "/dashboard/income",
      label: "আয়",
      roles: ["admin", "accountant"],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      ),
    },
    {
      href: "/dashboard/expenses",
      label: "ব্যয়",
      roles: ["admin", "accountant"],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="M19 12l-7 7-7-7" />
        </svg>
      ),
    },
    {
      href: "/dashboard/reports",
      label: "রিপোর্ট",
      roles: ["admin", "accountant", "viewer"],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M7 15l4-4 3 3 5-6" />
        </svg>
      ),
    },
    {
      href: "/admin/users",
      label: "ব্যবহারকারী",
      roles: ["admin"],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      href: "/admin/audit-logs",
      label: "অডিট লগ",
      roles: ["admin"],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8" />
          <path d="M8 17h5" />
        </svg>
      ),
    },
    {
      href: "/admin/closed-months",
      label: "মাস বন্ধ",
      roles: ["admin"],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
          <path d="M9 16l2 2 4-4" />
        </svg>
      ),
    },
    {
      href: "/admin/settings",
      label: "সেটিংস",
      roles: ["admin"],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      href: "/admin/clear-data",
      label: "ডেটা মুছুন",
      roles: ["admin"],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      ),
    },
  ];

  const visibleLinks = navLinks.filter((link) => link.roles.includes(role));
  const primaryLinks = visibleLinks.slice(0, 7);
  const secondaryLinks = visibleLinks.slice(7);

  /* MobileMenu-তে পাঠানোর জন্য serializable version (ReactNode বাদ) */
  const mobileLinks = visibleLinks.map((l) => ({
    href: l.href,
    label: l.label,
    icon: l.icon,
  }));

  return (
    <div className="layout-root">
      {/* ================= Header (no-print) ================= */}
      <div className="no-print">
        <header className="layout-header">
          <div className="layout-header-inner">
            {/* ---- Logo + Name ---- */}
            <Link href="/dashboard" className="layout-logo">
              <div className="layout-logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 L12 4" />
                  <path d="M12 4 C 8 6, 6 9, 6 13 L 6 21 L 18 21 L 18 13 C 18 9, 16 6, 12 4 Z" />
                  <path d="M10 21 L 10 17 C 10 15.5, 14 15.5, 14 17 L 14 21" />
                  <path d="M3 21 L 21 21" />
                </svg>
              </div>
              <div className="layout-logo-text">
                <div className="layout-logo-title">দারুল হিকমাহ</div>
                <div className="layout-logo-sub">মডেল মাদ্রাসা</div>
              </div>
            </Link>

            {/* ---- Desktop Primary Nav ---- */}
            <nav className="layout-nav-primary" aria-label="প্রধান মেনু">
              {primaryLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  variant="primary"
                  exact={link.href === "/dashboard"}
                />
              ))}
            </nav>

            {/* ---- Right side tools ---- */}
            <div className="layout-tools">
              <ThemeToggle />
              <NotificationBell userId={user?.id || ""} />

              <div className="layout-user-chip">
                <div className="layout-user-info">
                  <div className="layout-user-greet">আসসালামু আলাইকুম</div>
                  <div className="layout-user-name">{fullName}</div>
                </div>
                <div className="layout-user-avatar">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              </div>

              <LogoutButton />
              <MobileMenu
                navLinks={mobileLinks}
                fullName={fullName}
                role={role}
              />
            </div>
          </div>

          {/* ---- Desktop Secondary Nav (Admin links) ---- */}
          {secondaryLinks.length > 0 && (
            <div className="layout-nav-secondary-bar">
              <div className="layout-nav-secondary-inner">
                <span className="layout-nav-secondary-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2 L 4 6 v 6 c 0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10 V 6 Z" />
                  </svg>
                  Admin
                </span>
                {secondaryLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    variant="secondary"
                    exact={false}
                  />
                ))}
              </div>
            </div>
          )}
        </header>
      </div>

      {/* ================= Main content ================= */}
      <main className="layout-main">{children}</main>

      {/* ================= Global styles ================= */}
      <style jsx global>{`
        /* ========================================
           Layout Root
           ======================================== */
        .layout-root {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
          font-family: "Hind Siliguri", "Noto Sans Bengali", system-ui,
            -apple-system, "Segoe UI", sans-serif;
        }

        .layout-main {
          padding: 1.5rem 1rem 3rem;
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ========================================
           Hold Screen
           ======================================== */
        .layout-hold-wrapper {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: "Hind Siliguri", "Noto Sans Bengali", system-ui, sans-serif;
        }

        .layout-hold-card {
          max-width: 460px;
          width: 100%;
          background: #ffffff;
          border: 1px solid #fde68a;
          border-radius: 18px;
          padding: 2.25rem 1.75rem;
          text-align: center;
          box-shadow: 0 10px 30px -18px rgba(217, 119, 6, 0.35);
        }

        .layout-hold-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #fef3c7;
          color: #b45309;
          border: 1px solid #fcd34d;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
        }

        .layout-hold-icon svg {
          width: 30px;
          height: 30px;
        }

        .layout-hold-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #b45309;
          margin: 0 0 0.75rem;
        }

        .layout-hold-text {
          color: #475569;
          font-size: 0.95rem;
          margin: 0 0 0.5rem;
          line-height: 1.6;
        }

        .layout-hold-reason {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0 0 0.75rem;
          line-height: 1.6;
          background: #fef9c3;
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          display: inline-block;
        }

        .layout-hold-hint {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0;
          line-height: 1.6;
        }

        /* ========================================
           Header
           ======================================== */
        .layout-header {
          position: sticky;
          top: 0;
          z-index: 30;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: saturate(180%) blur(12px);
          -webkit-backdrop-filter: saturate(180%) blur(12px);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
        }

        .layout-header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        /* ---------- Logo ---------- */
        .layout-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          flex-shrink: 0;
        }

        .layout-logo-mark {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 14px -6px rgba(15, 118, 110, 0.5);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .layout-logo:hover .layout-logo-mark {
          transform: scale(1.05);
          box-shadow: 0 8px 18px -6px rgba(15, 118, 110, 0.65);
        }

        .layout-logo-mark svg {
          width: 22px;
          height: 22px;
        }

        .layout-logo-text {
          line-height: 1.15;
        }

        .layout-logo-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
        }

        .layout-logo-sub {
          font-size: 0.7rem;
          color: #64748b;
        }

        /* ---------- Primary Nav (pill container) ---------- */
        .layout-nav-primary {
          display: none;
          align-items: center;
          gap: 0.25rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 0.25rem;
          border-radius: 999px;
        }

        /* ---------- Right tools ---------- */
        .layout-tools {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .layout-user-chip {
          display: none;
          align-items: center;
          gap: 0.65rem;
          padding-left: 0.75rem;
          margin-left: 0.35rem;
          border-left: 1px solid #e2e8f0;
        }

        .layout-user-info {
          display: none;
          text-align: right;
          line-height: 1.15;
        }

        .layout-user-greet {
          font-size: 0.68rem;
          color: #94a3b8;
        }

        .layout-user-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: #0f172a;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .layout-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ccfbf1, #99f6e4);
          color: #0f766e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          border: 1px solid #99f6e4;
          box-shadow: 0 2px 6px -3px rgba(15, 118, 110, 0.35);
        }

        /* ---------- Secondary Nav Bar (Admin) ---------- */
        .layout-nav-secondary-bar {
          display: none;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .layout-nav-secondary-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          overflow-x: auto;
          scrollbar-width: thin;
        }

        .layout-nav-secondary-inner::-webkit-scrollbar {
          height: 4px;
        }

        .layout-nav-secondary-inner::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .layout-nav-secondary-label {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          font-weight: 700;
          color: #0f766e;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          flex-shrink: 0;
          margin-right: 0.35rem;
        }

        .layout-nav-secondary-label svg {
          width: 12px;
          height: 12px;
        }

        /* ========================================
           Responsive
           ======================================== */
        @media (min-width: 640px) {
          .layout-header-inner {
            padding: 0 1.5rem;
          }

          .layout-main {
            padding: 2rem 1.5rem 3rem;
          }

          .layout-user-chip {
            display: flex;
          }
        }

        @media (min-width: 768px) {
          .layout-user-info {
            display: block;
          }
        }

        @media (min-width: 1024px) {
          .layout-header-inner {
            height: 68px;
            padding: 0 2rem;
          }

          .layout-nav-primary {
            display: inline-flex;
          }

          .layout-nav-secondary-bar {
            display: block;
          }

          .layout-logo-mark {
            width: 44px;
            height: 44px;
            border-radius: 14px;
          }

          .layout-logo-mark svg {
            width: 24px;
            height: 24px;
          }

          .layout-logo-title {
            font-size: 0.95rem;
          }

          .layout-logo-sub {
            font-size: 0.72rem;
          }

          .layout-main {
            padding: 2.25rem 2rem 4rem;
          }
        }

        /* ========================================
           Dark Mode (class-based)
           ======================================== */
        .dark .layout-root {
          background: #020617;
          color: #e2e8f0;
        }

        .dark .layout-header {
          background: rgba(15, 23, 42, 0.85);
          border-bottom-color: #1e293b;
        }

        .dark .layout-logo-title { color: #f1f5f9; }
        .dark .layout-logo-sub { color: #94a3b8; }

        .dark .layout-nav-primary {
          background: #0f172a;
          border-color: #1e293b;
        }

        .dark .layout-user-chip { border-left-color: #1e293b; }
        .dark .layout-user-greet { color: #64748b; }
        .dark .layout-user-name { color: #e2e8f0; }
        .dark .layout-user-avatar {
          background: linear-gradient(135deg, rgba(15, 118, 110, 0.35), rgba(20, 184, 166, 0.25));
          color: #5eead4;
          border-color: rgba(94, 234, 212, 0.3);
        }

        .dark .layout-nav-secondary-bar {
          background: #0b1220;
          border-top-color: #1e293b;
        }

        .dark .layout-nav-secondary-label {
          color: #5eead4;
          background: rgba(15, 118, 110, 0.18);
          border-color: rgba(94, 234, 212, 0.3);
        }

        .dark .layout-hold-wrapper { background: #020617; }
        .dark .layout-hold-card {
          background: #0f172a;
          border-color: rgba(217, 119, 6, 0.35);
        }
        .dark .layout-hold-title { color: #fbbf24; }
        .dark .layout-hold-text, .dark .layout-hold-hint { color: #94a3b8; }
        .dark .layout-hold-reason {
          background: rgba(180, 83, 9, 0.18);
          color: #fcd34d;
        }

        /* Print */
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
