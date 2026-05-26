import Link from "next/link";
import { MOCK_ORDERS, MOCK_ADDRESSES } from "@/lib/mock-data";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import PaymentStatusBadge from "@/components/account/PaymentStatusBadge";
import AddressCard from "@/components/account/AddressCard";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AccountPage() {
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
      <div className="py-8 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1
          className="font-sans text-[32px] uppercase tracking-[0.64px] leading-none"
          style={{ color: "var(--color-foreground-dark)" }}
        >
          My Account
        </h1>
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
                {MOCK_ORDERS.map((order) => (
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
                        href={`/account/orders/${order.id}`}
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
          <div className="flex items-center justify-between mb-6">
            <h2
              className="font-sans text-[18px] uppercase tracking-[0.36px]"
              style={{ color: "var(--color-foreground-dark)" }}
            >
              Saved Addresses
            </h2>
            <button
              className="font-sans text-[11px] uppercase tracking-widest px-4 py-2 border hover:opacity-70"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-foreground-muted)",
                transition: "var(--transition-base)",
              }}
            >
              + Add Address
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            {MOCK_ADDRESSES.map((addr) => (
              <AddressCard key={addr.id} address={addr.shippingAddress} heading={addr.name} editable={true} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
