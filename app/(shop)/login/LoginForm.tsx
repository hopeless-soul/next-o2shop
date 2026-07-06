"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { login } from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/errors";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useCart } from "@/lib/cart/CartContext";
import { clearLocalAppState } from "@/lib/auth/clearLocalAppState";

const inputClass =
  "w-full px-4 py-3 text-sm outline-none font-secondary border border-border-input bg-input text-foreground";
const labelClass =
  "text-[12px] uppercase tracking-widest font-bold font-secondary text-foreground";

export default function LoginForm() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Form setup with react-hook-form and zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  // Silently re-authenticate if a valid refresh_token is already in the browser.
  // The browser sends refresh_token here because the POST goes to /auth/refresh
  // which matches the cookie's Path=/auth/refresh attribute.
  useEffect(() => {
    axios
      .post("/auth/refresh", null, { withCredentials: true })
      .then(() => router.replace("/account"))
      // If the refresh fails (e.g. no valid refresh_token),
      // we just stop checking and let the user log in manually.
      .catch(() => setIsCheckingSession(false));
  }, [router]);

  async function handleSubmit(values: LoginFormValues) {
    setError("");
    setIsPending(true);
    try {
      await login(values);
      clearLocalAppState(clearCart);
      router.push("/account");
    } catch (err) {
      // ApiError (normalized error provided by the frontend API) carries backend validation messages;
      // anything else (network failure, etc.) gets a generic fallback.
      if (err instanceof ApiError) {
        setError(err.messages[0] ?? err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      // Regardless of success or failure, is no longer pending.
      setIsPending(false);
    }
  }

  if (isCheckingSession) return null;

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
        Sign In
      </h1>

      {/* Form */}
      <Form {...form}>
        <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <label htmlFor="email" className={`block mb-1.5 ${labelClass}`}>
                  Email
                </label>
                <FormControl>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="johnny@o2shop.com"
                    className={inputClass}
                    style={{
                      borderRadius: "var(--radius-base)",
                      transition: "var(--transition-base)",
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="mt-1 text-xs" />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-[12px] hover:opacity-70 font-secondary text-foreground-subtle"
                    style={{
                      transition: "var(--transition-base)",
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <FormControl>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={inputClass}
                    style={{
                      borderRadius: "var(--radius-base)",
                      transition: "var(--transition-base)",
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="mt-1 text-xs" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            type="submit"
            disabled={isPending}
            className="mt-2"
          >
            {isPending ? "Signing in…" : "Sign In"}
          </Button>

          {/* Error Message */}
          {error && (
            <p
              className="text-[13px] text-center font-secondary text-destructive"
            >
              {error}
            </p>
          )}
        </form>
      </Form>

      {/* Registration Link */}
      <p
        className="text-center mt-6 text-sm font-secondary text-foreground-muted"
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold hover:opacity-70 text-foreground-dark"
          style={{
            transition: "var(--transition-base)",
          }}
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
