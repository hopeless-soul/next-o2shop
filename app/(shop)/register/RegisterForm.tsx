"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { register, login } from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/errors";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);
    try {
      await register({ email, password });
      await login({ email, password });
      router.push("/account");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.messages[0] ?? err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div
      className="w-full max-w-md bg-card shadow-2"
      style={{
        padding: "var(--space-10)",
      }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="font-sans text-2xl tracking-[0.15em] uppercase text-foreground-dark"
        >
          O2SHOP
        </Link>
      </div>

      <h1
        className="font-sans text-[32px] uppercase tracking-[0.64px] leading-none mb-8 text-center text-foreground-strong"
      >
        Create Account
      </h1>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block mb-1.5 text-[12px] uppercase tracking-widest font-bold font-secondary text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-sm outline-none font-secondary border border-border-input bg-input text-foreground"
            style={{
              borderRadius: "var(--radius-base)",
              transition: "var(--transition-base)",
            }}
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block mb-1.5 text-[12px] uppercase tracking-widest font-bold font-secondary text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 text-sm outline-none font-secondary border border-border-input bg-input text-foreground"
            style={{
              borderRadius: "var(--radius-base)",
              transition: "var(--transition-base)",
            }}
          />
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block mb-1.5 text-[12px] uppercase tracking-widest font-bold font-secondary text-foreground"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 text-sm outline-none font-secondary border border-border-input bg-input text-foreground"
            style={{
              borderRadius: "var(--radius-base)",
              transition: "var(--transition-base)",
            }}
          />
        </div>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          type="submit"
          disabled={isPending}
          className="mt-2"
        >
          {isPending ? "Creating account…" : "Create Account"}
        </Button>

        {error && (
          <p
            className="text-[13px] text-center font-secondary text-destructive"
          >
            {error}
          </p>
        )}
      </form>

      <p
        className="text-center mt-6 text-sm font-secondary text-foreground-muted"
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold hover:opacity-70 text-foreground-dark"
          style={{
            transition: "var(--transition-base)",
          }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
