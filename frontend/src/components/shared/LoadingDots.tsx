import { cn } from "@/lib/utils";

export interface LoadingDotsProps {
  className?: string;
  label?: string;
}

export function LoadingDots({ className, label }: LoadingDotsProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="status"
      aria-label={label ?? "Loading"}
    >
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-current animate-float"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      {label ? (
        <span className="text-sm text-muted-foreground">{label}</span>
      ) : null}
    </span>
  );
}

export default LoadingDots;
