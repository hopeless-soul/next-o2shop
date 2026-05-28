import { getMe } from "@/lib/api/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await getMe().catch(() => redirect("/login"));

  return (
    <div
      style={{
        padding: "var(--space-12)",
        maxWidth: "48rem",
        margin: "0 auto",
      }}
    >
      <h1
        className="font-sans text-[32px] uppercase tracking-[0.64px] mb-4"
        style={{ color: "var(--color-foreground-strong)" }}
      >
        Admin Dashboard
      </h1>
      <p
        style={{
          fontFamily: "var(--font-secondary)",
          color: "var(--color-foreground)",
        }}
      >
        Signed in as <strong>{user.email}</strong> &mdash; role:{" "}
        <strong>{user.role}</strong>
      </p>
    </div>
  );
}
