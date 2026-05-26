"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchPopupProps {
  open: boolean;
  onClose: () => void;
  background: string;
  textColor: string;
}

export default function SearchPopup({ open, onClose, background, textColor }: SearchPopupProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    handleClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Popup panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className={`fixed top-0 left-0 right-0 z-[80] transition-transform duration-300 ease-in-out ${
          open ? "translate-y-0 pointer-events-auto" : "-translate-y-full pointer-events-none"
        }`}
        style={{
          backgroundColor: background,
          boxShadow: "var(--shadow-4)",
          color: textColor,
        }}
      >
        <div
          style={{
            paddingTop: "var(--space-12)",
            paddingBottom: "var(--space-12)",
            paddingLeft: "var(--header-px-desktop)",
            paddingRight: "var(--header-px-desktop)",
          }}
        >
          {/* Close button */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleClose}
              aria-label="close search"
              className="opacity-70 hover:opacity-100"
              style={{ color: textColor, transition: "opacity var(--transition-nav)" }}
            >
              <X size={22} strokeWidth={1.75} />
            </button>
          </div>

          {/* Heading */}
          <h4
            className="uppercase tracking-widest mb-6"
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "var(--space-8)",
              color: textColor,
            }}
          >
            What are you looking for?
          </h4>

          {/* Search form */}
          <form onSubmit={handleSubmit} role="search">
            <div
              className="flex items-stretch"
              style={{ borderBottom: `1px solid ${textColor}`, opacity: 0.85 }}
            >
              <input
                ref={inputRef}
                type="search"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                autoComplete="off"
                className="flex-1 bg-transparent outline-none text-[15px] py-3 pr-3 placeholder:opacity-50"
                style={{
                  fontFamily: "var(--font-primary)",
                  color: textColor,
                }}
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="flex items-center py-3 pl-3 opacity-80 hover:opacity-100"
                style={{ color: textColor, transition: "opacity var(--transition-nav)" }}
              >
                <Search size={19} strokeWidth={1.75} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
