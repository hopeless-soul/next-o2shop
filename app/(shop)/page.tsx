import Link from "next/link";

export default function Home() {
  return (
    <section
      className="flex flex-col items-center justify-center min-h-screen text-center bg-foreground-dark"
    >
      <p
        className="text-sm tracking-[0.4em] uppercase mb-6 opacity-50 font-secondary text-on-dark"
      >
        New Arrivals 2026
      </p>
      <h1
        className="leading-none tracking-widest uppercase mb-8 font-sans text-on-dark"
        style={{
          fontSize: "clamp(3rem, 10vw, 7rem)",
        }}
      >
        O2SHOP
      </h1>
      <p
        className="text-base mb-10 opacity-60 max-w-xs leading-relaxed font-secondary text-on-dark"
      >
        Premium streetwear and accessories. No compromises.
      </p>
      <Link
        href="/products"
        className="font-sans text-[13px] uppercase tracking-widest px-10 py-4 border-2 hover:opacity-80 text-on-dark border-on-dark"
        style={{
          transition: "var(--transition-nav)",
        }}
      >
        Shop Now
      </Link>
    </section>
  );
}
