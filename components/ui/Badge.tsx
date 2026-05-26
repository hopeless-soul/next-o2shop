type BadgeVariant = "sale" | "new" | "sold-out";

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  sale: "bg-accent text-accent-foreground",
  new: "bg-primary text-primary-foreground",
  "sold-out": "bg-foreground-subtle text-primary-foreground",
};

const LABELS: Record<BadgeVariant, string> = {
  sale: "Sale",
  new: "New",
  "sold-out": "Sold Out",
};

export default function Badge({ variant, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-1.5 text-xs leading-none tracking-widest uppercase font-sans rounded-none ${VARIANT_STYLES[variant]} ${className}`}
      // subtle stroke improves legibility on colored backgrounds
      style={{ WebkitTextStroke: "0.3px white" }}
    >
      {LABELS[variant]}
    </span>
  );
}
