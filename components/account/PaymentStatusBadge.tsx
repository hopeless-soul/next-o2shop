import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; bg: string; color: string }
> = {
  paid: {
    label: "Paid",
    bg: "var(--color-payment-paid-bg)",
    color: "var(--color-payment-paid-fg)",
  },
  pending: {
    label: "Pending",
    bg: "var(--color-payment-pending-bg)",
    color: "var(--color-payment-pending-fg)",
  },
  refunded: {
    label: "Refunded",
    bg: "var(--color-payment-refunded-bg)",
    color: "var(--color-payment-refunded-fg)",
  },
  failed: {
    label: "Failed",
    bg: "var(--color-payment-failed-bg)",
    color: "var(--color-payment-failed-fg)",
  },
};

export default function PaymentStatusBadge({
  status,
  className = "",
}: PaymentStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn("inline-flex items-center justify-center h-6 min-w-[72px] text-[11px] uppercase tracking-widest font-sans rounded-none", className)}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}
