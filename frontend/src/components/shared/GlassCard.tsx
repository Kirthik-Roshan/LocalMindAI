"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  /** Disable the entrance animation. */
  static?: boolean;
}

export function GlassCard({
  className,
  children,
  static: isStatic = false,
  ...props
}: GlassCardProps) {
  if (isStatic) {
    return (
      <div
        className={cn(
          "glass rounded-2xl p-6 shadow-sm",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("glass rounded-2xl p-6 shadow-sm", className)}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}

export default GlassCard;
