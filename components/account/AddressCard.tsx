import type { Address } from "@/lib/mock-data";

interface AddressCardProps {
  address: Address;
  heading?: string;
}

export default function AddressCard({ address, heading }: AddressCardProps) {
  return (
    <div
      className="p-5 border"
      style={{ borderColor: "var(--color-border)" }}
    >
      {heading && (
        <p
          className="font-sans text-[11px] uppercase tracking-widest mb-3"
          style={{ color: "var(--color-foreground-subtle)" }}
        >
          {heading}
        </p>
      )}
      <div
        className="text-sm leading-6"
        style={{
          fontFamily: "var(--font-secondary)",
          color: "var(--color-foreground)",
        }}
      >
        <p className="font-semibold" style={{ color: "var(--color-foreground-dark)" }}>
          {address.firstName} {address.lastName}
        </p>
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>
          {address.city}, {address.state} {address.zip}
        </p>
        <p>{address.country}</p>
      </div>
      <button
        className="mt-4 font-sans text-[11px] uppercase tracking-widest border px-3 py-1 hover:opacity-70"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-foreground-muted)",
          transition: "var(--transition-base)",
        }}
      >
        Edit
      </button>
    </div>
  );
}
