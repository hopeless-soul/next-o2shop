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
    bg: "var(--color-fulfillment-unfulfilled-bg)",
    color: "var(--color-fulfillment-unfulfilled-fg)",
  },
  partially_fulfilled: {
    label: "Partial",
    bg: "var(--color-fulfillment-partial-bg)",
    color: "var(--color-fulfillment-partial-fg)",
  },
  fulfilled: {
    label: "Fulfilled",
    bg: "var(--color-fulfillment-fulfilled-bg)",
    color: "var(--color-fulfillment-fulfilled-fg)",
  },
  cancelled: {
    label: "Cancelled",
    bg: "var(--color-fulfillment-cancelled-bg)",
    color: "var(--color-fulfillment-cancelled-fg)",
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
