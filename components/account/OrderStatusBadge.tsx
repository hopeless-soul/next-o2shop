import type { OrderStatus } from "@/lib/types";
import StatusBadge, { type StatusBadgeConfig } from "@/components/account/StatusBadge";

// Maps each status to its label and color
const FULFILLMENT_STATUS_CONFIG: Record<OrderStatus, StatusBadgeConfig> = {
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

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export default function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps) {
  return (
    <StatusBadge config={FULFILLMENT_STATUS_CONFIG[status]} className={className} />
  );
}
