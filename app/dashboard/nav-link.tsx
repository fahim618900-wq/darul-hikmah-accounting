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
      <span>{label}</span>
    </Link>
  );
}
