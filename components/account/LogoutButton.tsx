"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth-client";
import { useCart } from "@/lib/cart/CartContext";
import { clearLocalAppState } from "@/lib/auth/clearLocalAppState";

export default function LogoutButton() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    try {
      await logout();
    } finally {
      clearLocalAppState(clearCart);
      router.push("/login");
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="font-sans text-[11px] uppercase tracking-widest px-4 py-2 border rounded-[var(--radius-sm)] hover:opacity-70 disabled:opacity-40"
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
