"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface Props {
  fallbackHref?: string;
  color?: string;
}

export default function BackButton({ fallbackHref = "/products", color }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-1 text-sm uppercase tracking-widest font-sans uppercase leading-tight opacity-90 hover:opacity-100 transition-opacity duration-200"
      style={{
        color: color ?? "var(--color-foreground-muted)",
        fontFamily: "var(--font-primary)",
        fontSize: "18px",
        fontWeight: '400',
        lineHeight: '24px',
        letterSpacing: "0.84px",
        fontStyle: 'italic'
        // textTransform: "capitalize",
        // WebkitTextStroke: ' var(--color-foreground-strong)'
      }}

    >
      <ChevronLeft size={20} style={{
        transform: "skewX(-12deg) translateY(-1px)",
      }} />
      Back
    </button>
  );
}
