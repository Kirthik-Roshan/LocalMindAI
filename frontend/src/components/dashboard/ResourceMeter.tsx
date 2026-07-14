"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResourceMeterProps {
  label: string;
  percent: number;
  detail?: string;
  icon?: LucideIcon;
  className?: string;
}

/**
 * A horizontal usage meter (CPU / memory / disk) with a gradient fill that
 * shifts toward a warning tone as utilisation climbs.
 */
export function ResourceMeter({
  label,
  percent,
  detail,
  icon: Icon,
  className,
}: ResourceMeterProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const tone =
    clamped >= 90
      ? "bg-destructive"
      : clamped >= 70
        ? "bg-warning"
        : "bg-gradient-brand";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          {Icon ? <Icon className="h-4 w-4" /> : null}
          {label}
        </span>
        <span className="font-medium text-foreground">
          {detail ?? `${clamped}%`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className={cn("h-full rounded-full", tone)}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default ResourceMeter;
