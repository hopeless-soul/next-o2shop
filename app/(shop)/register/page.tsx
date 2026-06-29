import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 pt-[calc(var(--header-height-desktop)+3rem)] bg-muted"
    >
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

        <form className="flex flex-col gap-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block mb-1.5 text-[12px] uppercase tracking-widest font-bold font-secondary text-foreground"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Alex"
                className="w-full px-4 py-3 text-sm outline-none font-secondary border border-border-input bg-input text-foreground"
                style={{
                  borderRadius: "var(--radius-base)",
                  transition: "var(--transition-base)",
                }}
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block mb-1.5 text-[12px] uppercase tracking-widest font-bold font-secondary text-foreground"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Turner"
                className="w-full px-4 py-3 text-sm outline-none font-secondary border border-border-input bg-input text-foreground"
                style={{
                  borderRadius: "var(--radius-base)",
                  transition: "var(--transition-base)",
                }}
              />
            </div>
          </div>

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
              className="w-full px-4 py-3 text-sm outline-none font-secondary border border-border-input bg-input text-foreground"
              style={{
                borderRadius: "var(--radius-base)",
                transition: "var(--transition-base)",
              }}
            />
          </div>

          <Button variant="primary" fullWidth size="lg" className="mt-2">
            Create Account
          </Button>
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
    </div>
  );
}
