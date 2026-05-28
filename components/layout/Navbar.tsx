"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import SearchPopup from "@/components/layout/SearchPopup";
import BackButton from "@/components/ui/BackButton";
import { NAV_CATEGORIES } from "@/lib/nav-config";

interface NavbarProps {
  background?: string;
  textColor?: string;
  scrolledBackground?: string;
  scrolledColor?: string;
}

export default function Navbar({
  background,
  textColor,
  scrolledBackground,
  scrolledColor,
}: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const routeConfig: NavbarProps = pathname === "/"
    ? {
      background: "var(--color-foreground-dark)",
      textColor: "var(--color-on-dark)",
      scrolledBackground: "var(--color-foreground-dark)",
      scrolledColor: "var(--color-on-dark)",
    }
    : pathname.startsWith("/products")
      ? {
        background: "transparent",
        textColor: "var(--color-foreground-dark)",
        scrolledBackground: "var(--color-foreground-dark)",
        scrolledColor: "var(--color-on-dark)",
      }
      : {
        background: "var(--color-foreground-dark)",
        textColor: "var(--color-on-dark)",
        scrolledBackground: "var(--color-foreground-dark)",
        scrolledColor: "var(--color-on-dark)",
      };

  const resolvedBg = background ?? routeConfig.background!;
  const resolvedText = textColor ?? routeConfig.textColor!;
  const resolvedScrolledBg = scrolledBackground ?? routeConfig.scrolledBackground!;
  const resolvedScrolledColor = scrolledColor ?? routeConfig.scrolledColor!;

  const currentBackground = scrolled ? resolvedScrolledBg : resolvedBg;
  const currentColor = scrolled ? resolvedScrolledColor : resolvedText;
  const logoFilter =
    currentColor === "var(--color-on-dark)"
      ? "brightness(0) invert(1)"
      : "brightness(0)";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (mobileOpen || searchOpen) ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  const openDropdown = (slug: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setActiveDropdown(slug);
  };

  const closeDropdown = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 80);
  };

  return (
    <>
      {/* ── Main header — logo + icons row only ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: currentBackground,
          transition: "background-color var(--transition-nav)",
        }}
      >
        {pathname.startsWith("/products/") && (
          <div className="absolute" style={{ top: 58, left: 40 }}>
            <BackButton color={currentColor} />
          </div>
        )}
        {/* Logo + icons row — owns the full header height */}
        <div
          className="grid grid-cols-3 items-center"
          style={{
            height: "var(--header-height-desktop)",
            paddingLeft: "var(--header-px-desktop)",
            paddingRight: "var(--header-px-desktop)",
          }}
        >
          {/* Col 1: mobile hamburger (left) */}
          <div className="flex items-center">
            <button
              className="md:hidden opacity-80 hover:opacity-100"
              style={{ color: currentColor, transition: "var(--transition-nav)" }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={1.75} />
            </button>
          </div>

          {/* Col 2: logo (center) */}
          <div className="flex justify-center">
            <Link href="/" aria-label="O2Shop home">
              <Image
                src="/logo.svg"
                alt="O2Shop"
                width={32}
                height={80}
                priority
                style={{
                  filter: logoFilter,
                  transition: "filter var(--transition-nav)",
                }}
              />
            </Link>
          </div>

          {/* Col 3: icons (right) */}
          <div className="flex items-center justify-end gap-5">
            <button
              className="opacity-80 hover:opacity-100"
              style={{ color: currentColor, transition: "var(--transition-nav)" }}
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={19} strokeWidth={1.75} />
            </button>
            <Link
              href="/account"
              className="opacity-80 hover:opacity-100"
              style={{ color: currentColor, transition: "var(--transition-nav)" }}
              aria-label="Account"
            >
              <User size={19} strokeWidth={1.75} />
            </Link>
            <button
              className="relative opacity-80 hover:opacity-100"
              style={{ color: currentColor, transition: "var(--transition-nav)" }}
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
          </div>
        </div>

      </header>

      {/* ── Category nav — fixed sibling, sits directly below header ── */}
      <nav
        className="hidden md:flex items-center justify-center fixed left-0 right-0 z-50"
        style={{
          top: "var(--header-height-desktop)",
          height: "40px",
          backgroundColor: currentBackground,
          boxShadow: scrolled ? "var(--shadow-3)" : "none",
          transition: "background-color var(--transition-nav), box-shadow var(--transition-nav)",
        }}
      >
        {NAV_CATEGORIES.map((cat) =>
          cat.subCategories.length ? (
            <div
              key={cat.slug}
              className="relative"
              onMouseEnter={() => openDropdown(cat.slug)}
              onMouseLeave={closeDropdown}
            >
              <Link
                href={cat.href}
                className="flex items-center px-[15px] font-sans text-[14px] font-semibold uppercase tracking-[0.3px] opacity-90 hover:opacity-100"
                style={{
                  color: currentColor,
                  lineHeight: "40px",
                  transition: "var(--transition-nav)",
                }}
              >
                {cat.displayName}
                <ChevronDown size={12} strokeWidth={2} className="ml-1" />
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
                  {cat.subCategories.map((subCat) => (
                    <Link
                      key={subCat.slug}
                      href={subCat.href}
                      className="block px-5 py-2 font-sans text-[12px] uppercase tracking-widest opacity-70 hover:opacity-100"
                      style={{
                        color: "var(--color-on-dark)",
                        transition: "var(--transition-nav)",
                      }}
                    >
                      {subCat.displayName}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={cat.slug}
              href={cat.href}
              className="block px-[15px] font-sans text-[14px] font-semibold uppercase tracking-[0.3px] opacity-90 hover:opacity-100"
              style={{
                color: currentColor,
                lineHeight: "40px",
                transition: "var(--transition-nav)",
              }}
            >
              {cat.displayName}
            </Link>
          )
        )}
      </nav>

      {/* ── Mobile drawer overlay ── */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Search popup ── */}
      <SearchPopup
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        background={currentBackground === 'transparent' ? resolvedScrolledColor : currentBackground}
        textColor={currentColor}
      />

      {/* ── Mobile drawer panel ── */}
      <div
        className={`fixed top-0 right-0 h-full z-[61] w-[80vw] max-w-sm flex flex-col transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "translate-x-full"
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
          {NAV_CATEGORIES.map((cat) =>
            cat.subCategories.length ? (
              <div key={cat.slug} className="mb-7">
                <p
                  className="font-sans text-[11px] uppercase tracking-widest mb-3"
                  style={{ color: "var(--color-on-dark)", opacity: 0.4 }}
                >
                  {cat.displayName}
                </p>
                {cat.subCategories.map((subCat) => (
                  <Link
                    key={subCat.slug}
                    href={subCat.href}
                    className="block py-2 font-sans text-[15px] uppercase tracking-[0.2em] opacity-80 hover:opacity-100"
                    style={{
                      color: "var(--color-on-dark)",
                      transition: "var(--transition-nav)",
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {subCat.displayName}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={cat.slug}
                href={cat.href}
                className="block py-2 mb-4 font-sans text-[15px] uppercase tracking-[0.2em] opacity-80 hover:opacity-100"
                style={{
                  color: "var(--color-on-dark)",
                  transition: "var(--transition-nav)",
                }}
                onClick={() => setMobileOpen(false)}
              >
                {cat.displayName}
              </Link>
            )
          )}
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
