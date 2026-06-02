import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/api/orders";
import { NotFoundError } from "@/lib/api/errors";
import type { OrderStatus } from "@/lib/types";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import AddressCard from "@/components/account/AddressCard";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const STATUS_STEPS: OrderStatus[] = [
  "unfulfilled",
  "partially_fulfilled",
  "fulfilled",
];

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let order;
  try {
    order = await getOrderByNumber(id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  const currentStep = STATUS_STEPS.indexOf(
    order.fulfillmentStatus === "cancelled" ? "unfulfilled" : order.fulfillmentStatus,
  );

  const subtotal = order.items.reduce((s, item) => s + item.total, 0);

  return (
    <div
      style={{
        paddingTop: "var(--header-height-desktop)",
        paddingLeft: "var(--header-px-desktop)",
        paddingRight: "var(--header-px-desktop)",
      }}
    >
      {/* Breadcrumbs */}
      <div className="py-4 border-b" style={{ borderColor: "var(--color-border-light)" }}>
        <p
          className="text-[12px] uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-secondary)",
            color: "var(--color-foreground-subtle)",
          }}
        >
          <Link href="/" className="hover:opacity-70" style={{ transition: "var(--transition-nav)" }}>
            Home
          </Link>
          {" / "}
          <Link href="/account" className="hover:opacity-70" style={{ transition: "var(--transition-nav)" }}>
            Account
          </Link>
          {" / "}
          <span style={{ color: "var(--color-foreground-dark)" }}>
            Order #{order.orderNumber}
          </span>
        </p>
      </div>

      {/* ── Order header ── */}
      <div className="py-8 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1
              className="font-sans text-[32px] uppercase tracking-[0.64px] leading-none mb-2"
              style={{ color: "var(--color-foreground-dark)" }}
            >
              Order #{order.orderNumber}
            </h1>
            <p
              className="text-sm"
              style={{
                fontFamily: "var(--font-secondary)",
                color: "var(--color-foreground-muted)",
              }}
            >
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.fulfillmentStatus} className="text-[13px] px-4 py-2" />
        </div>
      </div>

      {/* ── Status timeline ── */}
      {order.fulfillmentStatus !== "cancelled" && (
        <div className="py-8 border-b" style={{ borderColor: "var(--color-border-light)" }}>
          <div className="flex items-center gap-0 max-w-xl">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{
                      backgroundColor:
                        i <= currentStep ? "var(--color-foreground-dark)" : "transparent",
                      borderColor:
                        i <= currentStep ? "var(--color-foreground-dark)" : "var(--color-border)",
                    }}
                  />
                  <span
                    className="mt-2 text-[10px] uppercase tracking-widest font-sans text-center"
                    style={{
                      color:
                        i <= currentStep
                          ? "var(--color-foreground-dark)"
                          : "var(--color-foreground-subtle)",
                    }}
                  >
                    {step.replace("_", " ")}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-2"
                    style={{
                      backgroundColor:
                        i < currentStep ? "var(--color-foreground-subtle)" : "var(--color-border)",
                      transform: "translateY(-15px)", 
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="py-10 flex flex-col gap-10">
        {/* ── Line items table ── */}
        <section>
          <h2
            className="font-sans text-[15px] uppercase tracking-widest mb-5"
            style={{ color: "var(--color-foreground-dark)" }}
          >
            Items
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                  {["Product", "SKU", "Unit Price", "Qty", "Total"].map((h) => (
                    <th
                      key={h}
                      className="pb-3 text-left font-sans text-[11px] uppercase tracking-widest"
                      style={{ color: "var(--color-foreground-subtle)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b"
                    style={{ borderColor: "var(--color-border-light)" }}
                  >
                    <td className="py-4 pr-6">
                      <span
                        className="font-sans text-[13px] uppercase tracking-widest"
                        style={{ color: "var(--color-foreground-dark)" }}
                      >
                        {item.productName}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <span
                        className="text-sm"
                        style={{
                          fontFamily: "var(--font-secondary)",
                          color: "var(--color-foreground-muted)",
                        }}
                      >
                        {item.productSku}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <span
                        className="font-sans text-[13px]"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        ${item.productPrice}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <span
                        className="font-sans text-[13px]"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className="font-sans text-[13px]"
                        style={{ color: "var(--color-foreground-dark)" }}
                      >
                        ${item.total}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order totals */}
          <div className="mt-4 flex flex-col items-end gap-1.5 max-w-xs ml-auto">
            <div className="flex justify-between w-full">
              <span
                className="text-sm"
                style={{
                  fontFamily: "var(--font-secondary)",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Subtotal
              </span>
              <span className="font-sans text-[13px]" style={{ color: "var(--color-foreground)" }}>
                ${subtotal}
              </span>
            </div>
            <div className="flex justify-between w-full">
              <span
                className="text-sm"
                style={{
                  fontFamily: "var(--font-secondary)",
                  color: "var(--color-foreground-muted)",
                }}
              >
                Shipping
              </span>
              <span className="font-sans text-[13px]" style={{ color: "var(--color-foreground)" }}>
                {order.shippingPrice === 0 ? "Free" : `$${order.shippingPrice}`}
              </span>
            </div>
            <div
              className="flex justify-between w-full pt-2 border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span
                className="font-sans text-[13px] uppercase tracking-widest"
                style={{ color: "var(--color-foreground-dark)" }}
              >
                Total
              </span>
              <span
                className="font-sans text-[16px]"
                style={{ color: "var(--color-foreground-dark)" }}
              >
                ${order.totalAmount}
              </span>
            </div>
          </div>
        </section>

        {/* ── Addresses ── */}
        <section>
          <h2
            className="font-sans text-[15px] uppercase tracking-widest mb-5"
            style={{ color: "var(--color-foreground-dark)" }}
          >
            Addresses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <AddressCard address={order.shippingAddress} heading="Shipping Address" />
            <AddressCard address={order.billingAddress} heading="Billing Address" />
          </div>
        </section>
      </div>
    </div>
  );
}
