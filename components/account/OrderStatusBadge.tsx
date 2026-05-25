import type { OrderStatus } from "@/lib/mock-data";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; color: string }
> = {
  pending: {
    label: "Pending",
    bg: "var(--color-muted-2)",
    color: "var(--color-foreground-muted)",
  },
  processing: {
    label: "Processing",
    bg: "#fff3cd",
    color: "#856404",
  },
  shipped: {
    label: "Shipped",
    bg: "#cce5ff",
    color: "#004085",
  },
  delivered: {
    label: "Delivered",
    bg: "#d4edda",
    color: "#155724",
  },
  cancelled: {
    label: "Cancelled",
    bg: "#ffd9d9",
    color: "var(--color-destructive)",
  },
};

export default function OrderStatusBadge({
  status,
  className = "",
}: OrderStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[11px] uppercase tracking-widest font-sans rounded-none ${className}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}
