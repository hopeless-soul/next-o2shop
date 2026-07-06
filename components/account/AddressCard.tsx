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
    <div className="p-5 border border-border rounded-[var(--radius-sm)] flex flex-col">
      {/* Section label*/}
      {heading && (
        <p className="font-sans text-[11px] uppercase tracking-widest mb-3 text-foreground-subtle">
          {heading}
        </p>
      )}

      {/* Address details */}
      <div className="text-sm leading-6 font-secondary text-foreground">
        <p className="font-semibold text-foreground-dark">
          {address.firstName} {address.lastName}
        </p>
        <p>{address.address1}</p>
        {address.address2 && <p>{address.address2}</p>}
        <p>
          {address.city}, {address.province} {address.postalCode}
        </p>
        <p>{address.country}</p>
      </div>

      {/* Edit / delete actions */}
      {editable && (
        <div className="flex-1 flex items-end gap-2 pt-4">
          <button
            onClick={onEdit}
            className="font-sans text-[11px] uppercase tracking-widest border border-border text-foreground-muted px-3 py-1 hover:opacity-70"
            style={{ transition: "var(--transition-base)" }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="font-sans text-[11px] uppercase tracking-widest border border-destructive text-destructive px-3 py-1 hover:opacity-70"
            style={{ transition: "var(--transition-base)" }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
