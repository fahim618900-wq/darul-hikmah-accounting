import StudentView from "./view-client";

export default function StudentViewPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f5f7fa", padding: "2rem 1rem" }}>
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <StudentView />
      </div>
    </main>
  );
}
