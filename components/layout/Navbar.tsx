"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { MOCK_CATEGORIES } from "@/lib/mock-data";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const openDropdown = (slug: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setActiveDropdown(slug);
  };

  const closeDropdown = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 80);
  };

  return (
    <>
      {/* ── Main header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex flex-col"
        style={{
          height: "var(--header-height-desktop)",
          backgroundColor: scrolled
            ? "var(--color-foreground-strong)"
            : "transparent",
          boxShadow: scrolled ? "var(--shadow-3)" : "none",
          transition: "background-color var(--transition-nav), box-shadow var(--transition-nav)",
        }}
      >
        {/* Logo + icons row */}
        <div
          className="flex items-center justify-between"
          style={{
            flex: "0 0 52px",
            paddingLeft: "var(--header-px-desktop)",
            paddingRight: "var(--header-px-desktop)",
          }}
        >
          <Link
            href="/"
            className="font-sans text-[22px] tracking-[0.15em] uppercase"
            style={{
              color: "var(--color-on-dark)",
              transition: "var(--transition-nav)",
            }}
          >
            O2SHOP
          </Link>

          <div className="flex items-center gap-5">
            <button
              className="opacity-80 hover:opacity-100"
              style={{
                color: "var(--color-on-dark)",
                transition: "var(--transition-nav)",
              }}
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.75} />
            </button>
            <Link
              href="/account"
              className="opacity-80 hover:opacity-100"
              style={{
                color: "var(--color-on-dark)",
                transition: "var(--transition-nav)",
              }}
              aria-label="Account"
            >
              <User size={19} strokeWidth={1.75} />
            </Link>
            <button
              className="relative opacity-80 hover:opacity-100"
              style={{
                color: "var(--color-on-dark)",
                transition: "var(--transition-nav)",
              }}
              aria-label="Cart (3 items)"
            >
              <ShoppingBag size={19} strokeWidth={1.75} />
              <span
                className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-white leading-none"
                style={{
                  backgroundColor: "var(--color-badge-cart)",
                  fontSize: "9px",
                  fontFamily: "var(--font-secondary)",
                  fontWeight: 700,
                }}
              >
                3
              </span>
            </button>
            {/* Mobile hamburger */}
            <button
              className="md:hidden opacity-80 hover:opacity-100"
              style={{
                color: "var(--color-on-dark)",
                transition: "var(--transition-nav)",
              }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Category nav row — desktop only */}
        <nav
          className="hidden md:flex items-center justify-center"
          style={{ flex: "0 0 40px" }}
        >
          {MOCK_CATEGORIES.map((cat) => (
            <div
              key={cat.slug}
              className="relative"
              onMouseEnter={() => openDropdown(cat.slug)}
              onMouseLeave={closeDropdown}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="block px-[15px] font-sans text-[14px] font-semibold uppercase tracking-[0.3px] opacity-90 hover:opacity-100"
                style={{
                  color: "var(--color-on-dark)",
                  lineHeight: "40px",
                  transition: "var(--transition-nav)",
                }}
              >
                {cat.name}
              </Link>

              {/* Dropdown panel */}
              {activeDropdown === cat.slug && (
                <div
                  className="absolute top-full left-0 min-w-[190px] py-3"
                  style={{
                    backgroundColor: "var(--color-foreground-strong)",
                    boxShadow: "var(--shadow-4)",
                  }}
                  onMouseEnter={() => openDropdown(cat.slug)}
                  onMouseLeave={closeDropdown}
                >
                  {cat.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/products?category=${item.slug}`}
                      className="block px-5 py-2 font-sans text-[12px] uppercase tracking-widest opacity-70 hover:opacity-100"
                      style={{
                        color: "var(--color-on-dark)",
                        transition: "var(--transition-nav)",
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </header>

      {/* ── Mobile drawer overlay ── */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile drawer panel ── */}
      <div
        className={`fixed top-0 right-0 h-full z-[61] w-[80vw] max-w-sm flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "var(--color-foreground-strong)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <span
            className="font-sans text-[18px] tracking-widest uppercase"
            style={{ color: "var(--color-on-dark)" }}
          >
            Menu
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="opacity-70 hover:opacity-100"
            style={{ color: "var(--color-on-dark)", transition: "var(--transition-nav)" }}
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6">
          {MOCK_CATEGORIES.map((cat) => (
            <div key={cat.slug} className="mb-7">
              <p
                className="font-sans text-[11px] uppercase tracking-widest mb-3"
                style={{ color: "var(--color-on-dark)", opacity: 0.4 }}
              >
                {cat.name}
              </p>
              {cat.items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products?category=${item.slug}`}
                  className="block py-2 font-sans text-[15px] uppercase tracking-[0.2em] opacity-80 hover:opacity-100"
                  style={{
                    color: "var(--color-on-dark)",
                    transition: "var(--transition-nav)",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-5 py-6 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <Link
            href="/account"
            className="flex items-center gap-3 opacity-70 hover:opacity-100"
            style={{ color: "var(--color-on-dark)", transition: "var(--transition-nav)" }}
            onClick={() => setMobileOpen(false)}
          >
            <User size={17} strokeWidth={1.75} />
            <span className="font-sans text-[13px] uppercase tracking-widest">My Account</span>
          </Link>
        </div>
      </div>
    </>
  );
}
