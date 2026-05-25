import Link from "next/link";

const FOOTER_LINKS = [
  {
    group: "Shop",
    links: [
      { label: "Hats", href: "/products?category=hats" },
      { label: "Shirts", href: "/products?category=shirts" },
      { label: "Accessories", href: "/products?category=accessories" },
      { label: "Sale", href: "/products?category=sale" },
    ],
  },
  {
    group: "Info",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Sizing Guide", href: "/sizing" },
      { label: "Shipping & Returns", href: "/shipping" },
      { label: "About", href: "/about" },
    ],
  },
  {
    group: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Track My Order", href: "/track" },
      { label: "My Account", href: "/account" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--color-footer-bg)",
        borderTop: "1px solid black",
      }}
    >
      <div
        className="py-12"
        style={{
          paddingLeft: "var(--header-px-desktop)",
          paddingRight: "var(--header-px-desktop)",
        }}
      >
        {/* Mobile: column-reverse; Desktop: row */}
        <div className="flex flex-col-reverse gap-10 md:flex-row md:gap-8">
          {/* Brand column */}
          <div className="md:w-[28%]">
            <Link
              href="/"
              className="font-sans text-[22px] tracking-[0.15em] uppercase"
              style={{ color: "var(--color-foreground-dark)" }}
            >
              O2SHOP
            </Link>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{
                fontFamily: "var(--font-secondary)",
                color: "var(--color-footer-text)",
              }}
            >
              Premium streetwear and accessories.
              <br />
              Made to last.
            </p>
          </div>

          {/* Links grid */}
          <div className="flex-1 grid grid-cols-3 gap-6 md:gap-8">
            {FOOTER_LINKS.map((group) => (
              <div key={group.group}>
                <h4
                  className="mb-4 text-base font-bold leading-5"
                  style={{
                    fontFamily: "var(--font-secondary)",
                    color: "var(--color-foreground-dark)",
                  }}
                >
                  {group.group}
                </h4>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm leading-[18px] font-medium hover:opacity-80"
                        style={{
                          fontFamily: "var(--font-secondary)",
                          color: "var(--color-footer-text)",
                          transition: "var(--transition-nav)",
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright strip */}
      <div
        className="border-t py-4"
        style={{
          borderColor: "var(--color-border)",
          paddingLeft: "var(--header-px-desktop)",
          paddingRight: "var(--header-px-desktop)",
        }}
      >
        <p
          className="text-xs leading-[14px] font-semibold"
          style={{
            fontFamily: "var(--font-secondary)",
            color: "#a7a2a3",
          }}
        >
          © {new Date().getFullYear()} O2Shop. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
