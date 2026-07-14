import { cn } from "@/lib/utils";

export interface StatusPillProps {
  online: boolean;
  label?: string;
  className?: string;
}

export function StatusPill({ online, label, className }: StatusPillProps) {
  const text = label ?? (online ? "Online" : "Offline");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
        online
          ? "border-success/30 bg-success/10 text-success"
          : "border-destructive/30 bg-destructive/10 text-destructive",
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        {online ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
        ) : null}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            online ? "bg-success" : "bg-destructive",
          )}
        />
      </span>
      {text}
    </span>
  );
}

export default StatusPill;
