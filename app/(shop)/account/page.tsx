export const dynamic = 'force-dynamic';

import Link from "next/link";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import { listMyOrders } from "@/lib/api/orders";
import { listAddresses } from "@/lib/api/addresses-server";
import { AuthError } from "@/lib/api/errors";
import type { Order, SavedAddress } from "@/lib/types";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import PaymentStatusBadge from "@/components/account/PaymentStatusBadge";
import AddressesSection from "@/components/account/AddressesSection";
import LogoutButton from "@/components/account/LogoutButton";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function MobileAccountView({
  orders,
  addresses,
}: {
  orders: Order[]
  addresses: SavedAddress[]
}) {
  return (
    <div className="flex sm:hidden flex-col gap-10 py-8">
      <section>
        <h2
          className="font-sans text-[16px] uppercase tracking-widest mb-4"
          style={{ color: "var(--color-foreground-dark)" }}
        >
          Order History
        </h2>

        {orders.length === 0 ? (
          <p
            className="text-sm"
            style={{
              fontFamily: "var(--font-secondary)",
              color: "var(--color-foreground-subtle)",
            }}
          >
            No orders yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.orderNumber}`}
                className="block border p-4 transition-opacity hover:opacity-80"
                style={{
                  borderColor: "var(--color-border)",
                  boxShadow: "var(--shadow-1)",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className="font-sans text-[14px] uppercase tracking-widest leading-tight"
                    style={{ color: "var(--color-foreground-dark)" }}
                  >
                    #{order.orderNumber}
                  </span>
                  <span
                    className="font-sans text-[20px] leading-none shrink-0"
                    style={{ color: "var(--color-foreground-subtle)" }}
                  >
                    ›
                  </span>
                </div>
                <p
                  className="text-[11px] mb-3"
                  style={{
                    fontFamily: "var(--font-secondary)",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  {formatDate(order.createdAt)}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <OrderStatusBadge status={order.fulfillmentStatus} />
                </div>
                <p
                  className="font-sans text-[15px] tracking-widest"
                  style={{ color: "var(--color-foreground-dark)" }}
                >
                  ${order.totalAmount}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <AddressesSection initialAddresses={addresses} />
      </section>
    </div>
  )
}

export default async function AccountPage() {
  try {
    await getMe();
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  const [ordersResult, addresses] = await Promise.all([
    listMyOrders({ limit: 20 }),
    listAddresses(),
  ]);
  const orders = ordersResult.data;

  return (
    <div className="pt-[var(--header-height-mobile)] lg:pt-[var(--header-height-desktop)] px-[var(--header-px-mobile)] lg:px-[var(--header-px-desktop)]">
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
          <span style={{ color: "var(--color-foreground-dark)" }}>My Account</span>
        </p>
      </div>

      {/* Header */}
      <div className="py-8 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
        <h1
          className="font-sans text-[32px] uppercase tracking-[0.64px] leading-none"
          style={{ color: "var(--color-foreground-dark)" }}
        >
          My Account
        </h1>
        <LogoutButton />
      </div>

      {/* Mobile */}
      <MobileAccountView orders={orders} addresses={addresses} />

      {/* Desktop */}
      <div className="hidden sm:flex flex-col gap-12 py-10">
        <section>
          <h2
            className="font-sans text-[18px] uppercase tracking-[0.36px] mb-6"
            style={{ color: "var(--color-foreground-dark)" }}
          >
            Order History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                  {["Order", "Date", "Payment", "Fulfillment", "Total", ""].map((h) => (
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
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b"
                    style={{ borderColor: "var(--color-border-light)" }}
                  >
                    <td className="py-4">
                      <span
                        className="font-sans text-[14px] uppercase tracking-widest"
                        style={{ color: "var(--color-foreground-dark)" }}
                      >
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className="text-sm"
                        style={{
                          fontFamily: "var(--font-secondary)",
                          color: "var(--color-foreground-muted)",
                        }}
                      >
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="py-4">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="py-4">
                      <OrderStatusBadge status={order.fulfillmentStatus} />
                    </td>
                    <td className="py-4">
                      <span
                        className="font-sans text-[14px] tracking-widest"
                        style={{ color: "var(--color-foreground-dark)" }}
                      >
                        ${order.totalAmount}
                      </span>
                    </td>
                    <td className="py-4">
                      <Link
                        href={`/account/orders/${order.orderNumber}`}
                        className="font-sans text-[11px] uppercase tracking-widest px-3 py-2 hover:opacity-80"
                        style={{
                          backgroundColor: "var(--color-accent)",
                          color: "var(--color-accent-foreground)",
                          transition: "var(--transition-nav)",
                        }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <AddressesSection initialAddresses={addresses} />
        </section>
      </div>
    </div>
  );
}
