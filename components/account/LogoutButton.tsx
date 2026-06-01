"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth-client";

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="font-sans text-[11px] uppercase tracking-widest px-4 py-2 border hover:opacity-70 disabled:opacity-40"
      style={{
        borderColor: "var(--color-border)",
        color: "var(--color-foreground-muted)",
        transition: "var(--transition-base)",
      }}
    >
      {isPending ? "Signing out…" : "Sign Out"}
    </button>
  );
}
