import { cn } from "@/lib/utils";

export interface StatusBadgeConfig {
  label: string;
  bg: string;
  color: string;
}

interface StatusBadgeProps {
  config: StatusBadgeConfig;
  className?: string;
}

export default function StatusBadge({ config, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center h-6 min-w-[72px] text-[11px] uppercase tracking-widest font-sans rounded-none",
        className
      )}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}
