"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ClearDataClient() {
  const router = useRouter();
  const supabase = createClient();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClear() {
    if (confirmText !== "DELETE ALL") {
      setMessage("নিশ্চিত করতে 'DELETE ALL' টাইপ করুন");
      return;
    }

    setLoading(true);
    setMessage("");

    await supabase.from("fee_payments").delete().neq("id", 0);
    await supabase.from("monthly_fees").delete().neq("id", 0);
    await supabase.from("incomes").delete().neq("id", 0);
    await supabase.from("expenses").delete().neq("id", 0);
    await supabase.from("students").delete().neq("id", 0);

    setMessage("সব ডেটা মুছে ফেলা হয়েছে");
    setLoading(false);
    setConfirmText("");
    router.refresh();
  }

  return (
    <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #fecaca", maxWidth: "600px" }}>
      <h3 style={{ fontSize: "1.1rem", color: "#b91c1c", marginBottom: "1rem" }}>
        সব শিক্ষার্থী, বেতন, আয় ও ব্যয় মুছে ফেলুন
      </h3>

      <p style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "1rem" }}>
        এই কাজটি ফিরিয়ে আনা যাবে না। নিশ্চিত হলে নিচে <strong>DELETE ALL</strong> টাইপ করুন।
      </p>

      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="DELETE ALL"
        style={{ width: "100%", padding: "0.65rem", border: "1px solid #cbd5e1", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.95rem" }}
      />

      <button
        onClick={handleClear}
        disabled={loading || confirmText !== "DELETE ALL"}
        style={{
          padding: "0.75rem 1.5rem",
          background: confirmText === "DELETE ALL" ? "#b91c1c" : "#fecaca",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          fontSize: "0.95rem",
          fontWeight: "500",
          cursor: confirmText === "DELETE ALL" ? "pointer" : "not-allowed",
        }}
      >
        {loading ? "মুছে ফেলা হচ্ছে..." : "সব ডেটা মুছুন"}
      </button>

      {message && (
        <div style={{ marginTop: "1rem", padding: "0.75rem", background: message.includes("সফল") || message.includes("মুছে") ? "#dcfce7" : "#fef2f2", color: message.includes("সফল") || message.includes("মুছে") ? "#15803d" : "#b91c1c", borderRadius: "6px", fontSize: "0.9rem" }}>
          {message}
        </div>
      )}
    </div>
  );
}
