import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "base" | "lg" | "icon-sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground border-transparent hover:opacity-90",
  secondary:
    "bg-accent text-accent-foreground border-accent hover:opacity-90",
  ghost:
    "bg-transparent text-foreground border-border hover:bg-muted",
  outline:
    "bg-transparent text-foreground border-border hover:bg-muted",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-[10px] text-[11px] leading-[25px]",
  base: "px-6 py-[10px] text-[13px]",
  lg: "px-8 py-[14px] text-[13px]",
  "icon-sm": "size-7 p-0",
};

function Button({
  variant = "primary",
  size = "base",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center",
        "font-sans tracking-widest uppercase",
        "border-2 rounded-none",
        "cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth && "w-full",
        className
      )}
      style={{ transition: "var(--transition-nav)" }}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button };
export default Button;
