import StudentSelect from "./select-client";

export default function StudentPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f5f7fa", padding: "2rem 1rem" }}>
      <div className="container" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", color: "#0f766e", marginBottom: "0.5rem" }}>
            দারুল হিকমাহ মডেল মাদ্রাসা
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            শিক্ষার্থী পোর্টাল
          </p>
        </div>

        <StudentSelect />
      </div>
    </main>
  );
}
