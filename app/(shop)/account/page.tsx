export const dynamic = 'force-dynamic';

import Link from "next/link";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import { listMyOrders } from "@/lib/api/orders";
import { listAddresses } from "@/lib/api/addresses-server";
import { AuthError } from "@/lib/api/errors";
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

      <div className="py-10 flex flex-col gap-12">
        {/* ── Order History ── */}
        <section>
          <h2
            className="font-sans text-[18px] uppercase tracking-[0.36px] mb-6"
            style={{ color: "var(--color-foreground-dark)" }}
          >
            Order History
          </h2>

          {/* Desktop table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                  {["Order", "Date", "Payment", "Fulfillment", "Total", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="pb-3 text-left font-sans text-[11px] uppercase tracking-widest"
                        style={{ color: "var(--color-foreground-subtle)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
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

        {/* ── Saved Addresses ── */}
        <section>
          <AddressesSection initialAddresses={addresses} />
        </section>
      </div>
    </div>
  );
}
