"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { register, login } from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/errors";
import { registerSchema, type RegisterFormValues } from "@/lib/validation/auth";

const inputClass =
  "w-full px-4 py-3 text-sm outline-none font-secondary border border-border-input bg-input text-foreground";
const labelClass =
  "block mb-1.5 text-[12px] uppercase tracking-widest font-bold font-secondary text-foreground";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Form setup with react-hook-form and zod validation
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  async function handleSubmit(values: RegisterFormValues) {
    setError("");
    setIsPending(true);
    try {
      await register({ email: values.email, password: values.password });
      await login({ email: values.email, password: values.password });
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

      <Form {...form}>
        <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <label htmlFor="email" className={labelClass}>
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
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                <FormControl>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
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

          {/* Confirm password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <label htmlFor="confirmPassword" className={labelClass}>
                  Confirm Password
                </label>
                <FormControl>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat password"
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
      </Form>

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
