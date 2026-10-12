"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "0.5rem 1rem",
        background: "#ffffff",
        color: "#b91c1c",
        border: "1px solid #fecaca",
        borderRadius: "6px",
        fontSize: "0.9rem",
        fontWeight: "500",
      }}
    >
      লগআউট
    </button>
  );
}
