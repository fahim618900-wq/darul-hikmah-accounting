export default function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f7fa" }}>
      <div style={{ textAlign: "center" }}>
        <svg width="56" height="56" viewBox="0 0 50 50" style={{ animation: "spin 1s linear infinite", marginBottom: "1rem" }}>
          <circle cx="25" cy="25" r="20" fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" strokeDasharray="90, 150" />
        </svg>
        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>লোড হচ্ছে...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
