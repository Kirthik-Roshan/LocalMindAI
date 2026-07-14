"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Mic,
  Database,
  Search,
  Zap,
  Download,
  Settings,
  PanelLeftClose,
  PanelLeft,
  BrainCircuit,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useSystemStats } from "@/hooks/useSystemStats";
import { StatusPill } from "@/components/shared/StatusPill";
import { Tooltip } from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "AI Workspace", href: "/workspace", icon: Sparkles },
  { label: "Document Intelligence", href: "/documents", icon: FileText },
  { label: "Image Analysis", href: "/images", icon: ImageIcon },
  { label: "Voice Assistant", href: "/voice", icon: Mic },
  { label: "Knowledge Base", href: "/knowledge", icon: Database },
  { label: "Smart Search", href: "/search", icon: Search },
  { label: "Local Automation", href: "/automation", icon: Zap },
  { label: "Exports", href: "/exports", icon: Download },
  { label: "Settings", href: "/settings", icon: Settings },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { stats } = useSystemStats();

  const online = stats?.ollama?.online ?? false;
  const modelName = stats?.ollama?.model ?? "qwen2.5:3b";

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card/60 backdrop-blur-xl"
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-16 items-center gap-3 border-b border-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-sm">
          <BrainCircuit className="h-5 w-5 text-white" />
        </div>
        {!collapsed ? (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-foreground">
              LocalMind AI
            </span>
            <span className="text-[11px] text-muted-foreground">
              Private. Offline. Yours.
            </span>
          </div>
        ) : null}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          const link = (
            <Link
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-0",
                active
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-brand"
                  transition={{ duration: 0.25 }}
                />
              ) : null}
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  active && "text-primary",
                )}
              />
              {!collapsed ? (
                <span className="truncate">{item.label}</span>
              ) : null}
            </Link>
          );

          return (
            <div key={item.href}>
              {collapsed ? (
                <Tooltip content={item.label} side="right">
                  {link}
                </Tooltip>
              ) : (
                link
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer: Ollama status + collapse toggle */}
      <div className="border-t border-border p-3">
        {!collapsed ? (
          <div className="mb-3 rounded-xl bg-secondary/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Ollama
              </span>
              <StatusPill online={online} />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {modelName}
            </p>
          </div>
        ) : (
          <div className="mb-3 flex justify-center">
            <Tooltip
              content={online ? `Ollama online · ${modelName}` : "Ollama offline"}
              side="right"
            >
              <span className="relative flex h-3 w-3">
                {online ? (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
                ) : null}
                <span
                  className={cn(
                    "relative inline-flex h-3 w-3 rounded-full",
                    online ? "bg-success" : "bg-destructive",
                  )}
                />
              </span>
            </Tooltip>
          </div>
        )}

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
