import Link from "next/link";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{
        paddingTop: "calc(var(--header-height-desktop) + 3rem)",
        backgroundColor: "var(--color-muted)",
      }}
    >
      <div
        className="w-full max-w-md"
        style={{
          backgroundColor: "var(--color-card)",
          boxShadow: "var(--shadow-2)",
          padding: "var(--space-10)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-sans text-2xl tracking-[0.15em] uppercase"
            style={{ color: "var(--color-foreground-dark)" }}
          >
            O2SHOP
          </Link>
        </div>

        <h1
          className="font-sans text-[32px] uppercase tracking-[0.64px] leading-none mb-8 text-center"
          style={{ color: "var(--color-foreground-strong)" }}
        >
          Sign In
        </h1>

        <form className="flex flex-col gap-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-1.5 text-[12px] uppercase tracking-widest font-bold"
              style={{
                fontFamily: "var(--font-secondary)",
                color: "var(--color-foreground)",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 text-sm outline-none"
              style={{
                fontFamily: "var(--font-secondary)",
                border: "1px solid var(--color-border-input)",
                borderRadius: "var(--radius-base)",
                backgroundColor: "var(--color-input)",
                color: "var(--color-foreground)",
                transition: "var(--transition-base)",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="text-[12px] uppercase tracking-widest font-bold"
                style={{
                  fontFamily: "var(--font-secondary)",
                  color: "var(--color-foreground)",
                }}
              >
                Password
              </label>
              <a
                href="#"
                className="text-[12px] hover:opacity-70"
                style={{
                  fontFamily: "var(--font-secondary)",
                  color: "var(--color-foreground-subtle)",
                  transition: "var(--transition-base)",
                }}
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm outline-none"
              style={{
                fontFamily: "var(--font-secondary)",
                border: "1px solid var(--color-border-input)",
                borderRadius: "var(--radius-base)",
                backgroundColor: "var(--color-input)",
                color: "var(--color-foreground)",
                transition: "var(--transition-base)",
              }}
            />
          </div>

          <Button variant="primary" fullWidth size="lg" className="mt-2">
            Sign In
          </Button>
        </form>

        <p
          className="text-center mt-6 text-sm"
          style={{
            fontFamily: "var(--font-secondary)",
            color: "var(--color-foreground-muted)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold hover:opacity-70"
            style={{
              color: "var(--color-foreground-dark)",
              transition: "var(--transition-base)",
            }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
