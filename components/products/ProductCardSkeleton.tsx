import Skeleton from "@/components/ui/Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="block">
      {/* Image area */}
      <Skeleton className="w-full rounded-none" style={{ aspectRatio: "4/5" }} />

      {/* Details area */}
      <div
        className="flex flex-col gap-[var(--space-2)]"
        style={{ padding: "var(--space-5)" }}
      >
        {/* Title + price row */}
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 rounded-none" style={{ width: "60%" }} />
          <Skeleton className="h-4 rounded-none" style={{ width: "20%" }} />
        </div>
        {/* Sub row */}
        <Skeleton className="h-3 rounded-none" style={{ width: "35%" }} />
      </div>
    </div>
  );
}
