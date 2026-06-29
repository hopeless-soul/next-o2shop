import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; color: string }
> = {
  unfulfilled: {
    label: "Unfulfilled",
    bg: "var(--color-muted-2)",
    color: "var(--color-foreground-muted)",
  },
  partially_fulfilled: {
    label: "Partial",
    bg: "var(--color-status-warning-bg)",
    color: "var(--color-status-warning-fg)",
  },
  fulfilled: {
    label: "Fulfilled",
    bg: "var(--color-status-success-bg)",
    color: "var(--color-status-success-fg)",
  },
  cancelled: {
    label: "Cancelled",
    bg: "var(--color-status-info-bg)",
    color: "var(--color-status-info-fg)",
  },
};

export default function OrderStatusBadge({
  status,
  className = "",
}: OrderStatusBadgeProps) {
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
