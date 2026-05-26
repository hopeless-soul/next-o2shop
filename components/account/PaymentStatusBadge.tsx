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
    bg: "var(--color-status-success-bg)",
    color: "var(--color-status-success-fg)",
  },
  pending: {
    label: "Pending",
    bg: "var(--color-muted-2)",
    color: "var(--color-foreground-muted)",
  },
  refunded: {
    label: "Refunded",
    bg: "var(--color-status-warning-bg)",
    color: "var(--color-status-warning-fg)",
  },
  failed: {
    label: "Failed",
    bg: "var(--color-muted-2)",
    color: "var(--color-destructive)",
  },
};

export default function PaymentStatusBadge({
  status,
  className = "",
}: PaymentStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center justify-center h-6 min-w-[72px] text-[11px] uppercase tracking-widest font-sans rounded-none ${className}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}
