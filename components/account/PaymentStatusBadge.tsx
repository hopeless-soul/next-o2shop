import type { PaymentStatus } from "@/lib/types";
import StatusBadge, { type StatusBadgeConfig } from "@/components/account/StatusBadge";

// Maps each status to its label and color
const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, StatusBadgeConfig> = {
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

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export default function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  return <StatusBadge config={PAYMENT_STATUS_CONFIG[status]} className={className} />;
}
