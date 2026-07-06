import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/api/orders";
import { NotFoundError } from "@/lib/api/errors";
import type { OrderStatus } from "@/lib/types";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import AddressCard from "@/components/account/AddressCard";
import { cn } from "@/lib/utils";

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

type OrderDetail = Awaited<ReturnType<typeof getOrderByNumber>>
type OrderLineItem = OrderDetail["items"][number]

function ItemThumbnail({ item, className }: { item: OrderLineItem; className: string }) {
  if (!item.productImageUrl) {
    return <div className={cn(className, "bg-border-light shrink-0")} />;
  }
  return (
    <div className={cn(className, "relative overflow-hidden shrink-0 bg-border-light")}>
      <Image
        src={item.productImageUrl}
        alt={item.productName}
        fill
        className="object-cover"
        sizes="64px"
      />
    </div>
  );
}

function MobileOrderView({
  order,
  subtotal,
}: {
  order: OrderDetail
  subtotal: number
}) {
  return (
    <div className="flex sm:hidden flex-col gap-10 py-8">
      {/* Items */}
      <section>
        <h2
          className="font-sans text-[15px] uppercase tracking-widest mb-4 text-foreground-dark"
        >
          Items
        </h2>
        <div className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 border p-4 border-border shadow-1"
            >
              <ItemThumbnail item={item} className="w-16 h-16 rounded-sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className="font-sans text-[13px] uppercase tracking-widest leading-tight text-foreground-dark"
                  >
                    {item.productName}
                  </span>
                  <span
                    className="font-sans text-[13px] shrink-0 text-foreground-dark"
                  >
                    ${item.total}
                  </span>
                </div>
                <p
                  className="font-secondary text-[11px] mb-1 text-foreground-muted"
                >
                  {item.productSku}
                </p>
                <p
                  className="font-secondary text-[11px] text-foreground-muted"
                >
                  ${item.productPrice} × {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Totals */}
      <div
        className="flex flex-col gap-1.5 border-t pt-4 border-border-light"
      >
        <div className="flex justify-between">
          <span
            className="font-secondary text-sm text-foreground-muted"
          >
            Subtotal
          </span>
          <span className="font-sans text-[13px] text-foreground">
            ${subtotal}
          </span>
        </div>
        <div className="flex justify-between">
          <span
            className="font-secondary text-sm text-foreground-muted"
          >
            Shipping
          </span>
          <span className="font-sans text-[13px] text-foreground">
            {order.shippingPrice === 0 ? "Free" : `$${order.shippingPrice}`}
          </span>
        </div>
        <div
          className="flex justify-between pt-2 border-t border-border"
        >
          <span
            className="font-sans text-[13px] uppercase tracking-widest text-foreground-dark"
          >
            Total
          </span>
          <span
            className="font-sans text-[16px] text-foreground-dark"
          >
            ${order.totalAmount}
          </span>
        </div>
      </div>

      {/* Addresses */}
      <section>
        <h2
          className="font-sans text-[15px] uppercase tracking-widest mb-4 text-foreground-dark"
        >
          Address
        </h2>
        <div className="flex flex-col gap-4">
          <AddressCard address={order.shippingAddress} heading="Shipping Address" />
          <AddressCard address={order.billingAddress} heading="Billing Address" />
        </div>
      </section>
    </div>
  )
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let order: OrderDetail;
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
    <div className="pt-[var(--header-height-mobile)] lg:pt-[var(--header-height-desktop)] px-[var(--header-px-mobile)] lg:px-[var(--header-px-desktop)]">
      {/* Breadcrumbs */}
      <div className="py-4 border-b border-border-light">
        <p
          className="font-secondary text-[12px] uppercase tracking-widest text-foreground-subtle"
        >
          <Link href="/" className="hover:opacity-70" style={{ transition: "var(--transition-nav)" }}>
            Home
          </Link>
          {" / "}
          <Link href="/account" className="hover:opacity-70" style={{ transition: "var(--transition-nav)" }}>
            Account
          </Link>
          {" / "}
          <span className="text-foreground-dark">
            Order #{order.orderNumber}
          </span>
        </p>
      </div>

      {/* Order header — shared */}
      <div className="py-8 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1
              className="font-sans text-[22px] sm:text-[32px] uppercase tracking-[0.64px] leading-none mb-2 text-foreground-dark"
            >
              Order #{order.orderNumber}
            </h1>
            <p
              className="font-secondary text-sm text-foreground-muted"
            >
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.fulfillmentStatus} className="text-[13px] px-4 py-2" />
        </div>
      </div>

      {/* Status timeline — shared */}
      {order.fulfillmentStatus !== "cancelled" && (
        <div className="py-8 border-b border-border-light">
          <div className="flex items-center gap-0 w-full max-w-xl">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      i <= currentStep ? "bg-foreground-dark border-foreground-dark" : "bg-transparent border-border"
                    )}
                  />
                  <span
                    className={cn(
                      "mt-2 text-[10px] uppercase tracking-widest font-sans text-center",
                      i <= currentStep ? "text-foreground-dark" : "text-foreground-subtle"
                    )}
                  >
                    {step.replace("_", " ")}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2",
                      i < currentStep ? "bg-foreground-subtle" : "bg-border"
                    )}
                    style={{ transform: "translateY(-15px)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile */}
      <MobileOrderView order={order} subtotal={subtotal} />

      {/* Desktop */}
      <div className="hidden sm:flex flex-col gap-10 py-10">
        <section>
          <h2
            className="font-sans text-[15px] uppercase tracking-widest mb-5 text-foreground-dark"
          >
            Items
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  {["Product", "SKU", "Unit Price", "Qty", "Total"].map((h) => (
                    <th
                      key={h}
                      className="pb-3 text-left font-sans text-[11px] uppercase tracking-widest text-foreground-subtle"
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
                    className="border-b border-border-light"
                  >
                    <td className="py-4 pr-6">
                      <div className="flex items-center gap-3">
                        <ItemThumbnail item={item} className="w-12 h-12 rounded-sm" />
                        <span
                          className="font-sans text-[13px] uppercase tracking-widest text-foreground-dark"
                        >
                          {item.productName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-6">
                      <span
                        className="font-secondary text-sm text-foreground-muted"
                      >
                        {item.productSku}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <span
                        className="font-sans text-[13px] text-foreground"
                      >
                        ${item.productPrice}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <span
                        className="font-sans text-[13px] text-foreground"
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className="font-sans text-[13px] text-foreground-dark"
                      >
                        ${item.total}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col items-end gap-1.5 max-w-xs ml-auto">
            <div className="flex justify-between w-full">
              <span
                className="font-secondary text-sm text-foreground-muted"
              >
                Subtotal
              </span>
              <span className="font-sans text-[13px] text-foreground">
                ${subtotal}
              </span>
            </div>
            <div className="flex justify-between w-full">
              <span
                className="font-secondary text-sm text-foreground-muted"
              >
                Shipping
              </span>
              <span className="font-sans text-[13px] text-foreground">
                {order.shippingPrice === 0 ? "Free" : `$${order.shippingPrice}`}
              </span>
            </div>
            <div
              className="flex justify-between w-full pt-2 border-t border-border"
            >
              <span
                className="font-sans text-[13px] uppercase tracking-widest text-foreground-dark"
              >
                Total
              </span>
              <span
                className="font-sans text-[16px] text-foreground-dark"
              >
                ${order.totalAmount}
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2
            className="font-sans text-[15px] uppercase tracking-widest mb-5 text-foreground-dark"
          >
            Address
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
