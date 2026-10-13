"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavLinkProps = {
  href: string;
  label: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
  exact?: boolean;
};

export default function NavLink({
  href,
  label,
  icon,
  variant = "primary",
  exact = false,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  const base =
    variant === "primary"
      ? "nav-link nav-link-primary"
      : "nav-link nav-link-secondary";

  return (
    <Link
      href={href}
      className={`${base} ${isActive ? "nav-link-active" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {icon && <span className="nav-link-icon">{icon}</span>}
      <span className="nav-link-label">{label}</span>

      {/* Active indicator dot (primary only) */}
      {variant === "primary" && isActive && (
        <span className="nav-link-dot" aria-hidden="true" />
      )}

      {/* Tooltip for secondary variant */}
      {variant === "secondary" && (
        <span className="nav-link-tooltip" role="tooltip">
          {label}
        </span>
      )}

      <style>{`
        /* =========================================
           Base
           ========================================= */
        .nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          text-decoration: none;
          font-weight: 500;
          white-space: nowrap;
          font-family: inherit;
          transition:
            background-color 0.18s cubic-bezier(0.2, 0.8, 0.2, 1),
            color 0.18s ease,
            box-shadow 0.2s ease,
            transform 0.12s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-link:focus-visible {
          outline: 2px solid #0f766e;
          outline-offset: 2px;
          border-radius: 999px;
        }

        .nav-link-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .nav-link-icon svg {
          width: 16px;
          height: 16px;
        }
        .nav-link:hover .nav-link-icon {
          transform: scale(1.08);
        }

        /* =========================================
           PRIMARY variant (pill nav)
           ========================================= */
        .nav-link-primary {
          padding: 0.45rem 0.85rem;
          border-radius: 999px;
          font-size: 0.82rem;
          color: #475569;
          background: transparent;
        }
        .nav-link-primary:hover {
          background: #ffffff;
          color: #0f172a;
          box-shadow:
            0 1px 2px rgba(15, 23, 42, 0.06),
            0 4px 10px -6px rgba(15, 23, 42, 0.12);
        }
        .nav-link-primary.nav-link-active {
          background: linear-gradient(135deg, #0f766e, #0d9488);
          color: #ffffff;
          box-shadow:
            0 1px 2px rgba(15, 118, 110, 0.2),
            0 6px 14px -6px rgba(15, 118, 110, 0.55);
        }
        .nav-link-primary.nav-link-active:hover {
          background: linear-gradient(135deg, #0d6b63, #0f8e83);
          color: #ffffff;
        }

        /* Active indicator dot */
        .nav-link-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #fde68a;
          margin-left: 0.15rem;
          box-shadow: 0 0 6px rgba(253, 230, 138, 0.8);
          animation: navDotIn 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2);
        }
        @keyframes navDotIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* =========================================
           SECONDARY variant (admin chips)
           ========================================= */
        .nav-link-secondary {
          padding: 0.35rem 0.7rem;
          border-radius: 8px;
          font-size: 0.78rem;
          color: #64748b;
          background: transparent;
        }
        .nav-link-secondary:hover {
          background: #ffffff;
          color: #0f172a;
        }
        .nav-link-secondary.nav-link-active {
          background: #ecfdf5;
          color: #0f766e;
          box-shadow: inset 0 0 0 1px #a7f3d0;
          font-weight: 600;
        }
        .nav-link-secondary.nav-link-active:hover {
          background: #d1fae5;
        }

        /* Tooltip (only for secondary variant) */
        .nav-link-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          padding: 0.35rem 0.6rem;
          background: #0f172a;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 500;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition:
            opacity 0.15s ease,
            transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
          z-index: 100;
          box-shadow: 0 4px 12px -4px rgba(15, 23, 42, 0.35);
        }
        .nav-link-tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: #0f172a;
        }
        .nav-link-secondary:hover .nav-link-tooltip,
        .nav-link-secondary:focus-visible .nav-link-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* =========================================
           Dark Mode
           ========================================= */
        .dark .nav-link-primary {
          color: #cbd5e1;
        }
        .dark .nav-link-primary:hover {
          background: #1e293b;
          color: #ffffff;
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.3),
            0 4px 10px -6px rgba(0, 0, 0, 0.5);
        }
        .dark .nav-link-primary.nav-link-active {
          background: linear-gradient(135deg, #0f766e, #0d9488);
          color: #ffffff;
          box-shadow:
            0 1px 2px rgba(15, 118, 110, 0.3),
            0 6px 14px -6px rgba(15, 118, 110, 0.75);
        }

        .dark .nav-link-secondary {
          color: #94a3b8;
        }
        .dark .nav-link-secondary:hover {
          background: #1e293b;
          color: #e2e8f0;
        }
        .dark .nav-link-secondary.nav-link-active {
          background: rgba(15, 118, 110, 0.2);
          color: #5eead4;
          box-shadow: inset 0 0 0 1px rgba(94, 234, 212, 0.3);
        }
        .dark .nav-link-secondary.nav-link-active:hover {
          background: rgba(15, 118, 110, 0.3);
        }

        .dark .nav-link-tooltip {
          background: #1e293b;
          color: #f1f5f9;
          box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.7);
        }
        .dark .nav-link-tooltip::after {
          border-top-color: #1e293b;
        }

        /* =========================================
           Reduced Motion
           ========================================= */
        @media (prefers-reduced-motion: reduce) {
          .nav-link,
          .nav-link-icon,
          .nav-link-tooltip,
          .nav-link-dot {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </Link>
  );
}
