import type { AddressDto } from "@/lib/types";

interface AddressCardProps {
  address: AddressDto;
  heading?: string;
  editable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function AddressCard({ address, heading, editable = false, onEdit, onDelete }: AddressCardProps) {
  return (
    <div
      className="p-5 border flex flex-col"
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
        <p>{address.address1}</p>
        {address.address2 && <p>{address.address2}</p>}
        <p>
          {address.city}, {address.province} {address.postalCode}
        </p>
        <p>{address.country}</p>
      </div>
      {editable && (
        <div className="flex-1 flex items-end gap-2 pt-4">
          <button
            onClick={onEdit}
            className="font-sans text-[11px] uppercase tracking-widest border px-3 py-1 hover:opacity-70"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-foreground-muted)",
              transition: "var(--transition-base)",
            }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="font-sans text-[11px] uppercase tracking-widest border px-3 py-1 hover:opacity-70"
            style={{
              borderColor: "var(--color-destructive)",
              color: "var(--color-destructive)",
              transition: "var(--transition-base)",
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
