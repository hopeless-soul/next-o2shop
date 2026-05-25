import Link from "next/link";

export default function Home() {
  return (
    <section
      className="flex flex-col items-center justify-center min-h-screen text-center"
      style={{ backgroundColor: "var(--color-foreground-dark)" }}
    >
      <p
        className="text-sm tracking-[0.4em] uppercase mb-6 opacity-50"
        style={{ fontFamily: "var(--font-secondary)", color: "var(--color-on-dark)" }}
      >
        New Arrivals 2025
      </p>
      <h1
        className="leading-none tracking-widest uppercase mb-8"
        style={{
          fontFamily: "var(--font-primary)",
          color: "var(--color-on-dark)",
          fontSize: "clamp(3rem, 10vw, 7rem)",
        }}
      >
        O2SHOP
      </h1>
      <p
        className="text-base mb-10 opacity-60 max-w-xs leading-relaxed"
        style={{ fontFamily: "var(--font-secondary)", color: "var(--color-on-dark)" }}
      >
        Premium streetwear and accessories. No compromises.
      </p>
      <Link
        href="/products"
        className="font-sans text-[13px] uppercase tracking-widest px-10 py-4 border-2 hover:opacity-80"
        style={{
          color: "var(--color-on-dark)",
          borderColor: "var(--color-on-dark)",
          transition: "var(--transition-nav)",
        }}
      >
        Shop Now
      </Link>
    </section>
  );
}
