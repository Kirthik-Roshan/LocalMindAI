"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionItem<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

export interface ActionToolbarProps<T extends string = string> {
  actions: ActionItem<T>[];
  value?: T | null;
  onSelect: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A pill-grid of selectable AI actions, reused across the workspace, document,
 * and image modules.
 */
export function ActionToolbar<T extends string = string>({
  actions,
  value,
  onSelect,
  disabled = false,
  className,
}: ActionToolbarProps<T>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        const active = value === action.value;
        return (
          <button
            key={action.value}
            type="button"
            disabled={disabled}
            title={action.description}
            onClick={() => onSelect(action.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "border-transparent bg-gradient-brand text-white shadow-glow-sm"
                : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

export default ActionToolbar;
