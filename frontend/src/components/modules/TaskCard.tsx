"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  selected?: boolean;
  onClick?: () => void;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * A selectable/actionable card used for automation tasks and quick actions.
 */
export function TaskCard({
  title,
  description,
  icon: Icon,
  selected = false,
  onClick,
  footer,
  className,
}: TaskCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col gap-3 rounded-2xl border p-5 text-left transition-all duration-200",
        selected
          ? "border-primary/60 bg-primary/10 shadow-glow-sm"
          : "border-border bg-card/60 hover:border-primary/40 hover:bg-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {Icon ? (
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
              selected
                ? "bg-gradient-brand text-white shadow-glow-sm"
                : "bg-secondary/60 text-primary group-hover:bg-primary/15",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {footer ? <div className="mt-auto pt-1">{footer}</div> : null}
    </motion.button>
  );
}

export default TaskCard;
