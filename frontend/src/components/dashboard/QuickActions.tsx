"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PenLine,
  FileText,
  ImageIcon,
  Mic,
  Library,
  Search,
  Workflow,
  Download,
  type LucideIcon,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const ACTIONS: QuickAction[] = [
  {
    label: "AI Workspace",
    description: "Write & transform text",
    href: "/workspace",
    icon: PenLine,
  },
  {
    label: "Documents",
    description: "Analyze & summarize",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Image Analysis",
    description: "OCR & describe",
    href: "/images",
    icon: ImageIcon,
  },
  {
    label: "Voice",
    description: "Transcribe & command",
    href: "/voice",
    icon: Mic,
  },
  {
    label: "Knowledge Base",
    description: "Ask your files",
    href: "/knowledge",
    icon: Library,
  },
  {
    label: "Smart Search",
    description: "Find anything",
    href: "/search",
    icon: Search,
  },
  {
    label: "Automation",
    description: "Run local tasks",
    href: "/automation",
    icon: Workflow,
  },
  {
    label: "Exports",
    description: "Download results",
    href: "/exports",
    icon: Download,
  },
];

export function QuickActions() {
  return (
    <GlassCard>
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={action.href}
              className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-card/40 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors group-hover:bg-gradient-brand group-hover:text-white">
                <action.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

export default QuickActions;
