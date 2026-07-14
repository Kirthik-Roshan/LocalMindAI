"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Command, Search, Cpu, MemoryStick } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useSystemStats } from "@/hooks/useSystemStats";
import { StatusPill } from "@/components/shared/StatusPill";
import { Tooltip } from "@/components/ui/tooltip";
import { cn, round } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/workspace": "AI Workspace",
  "/documents": "Document Intelligence",
  "/images": "Image Analysis",
  "/voice": "Voice Assistant",
  "/knowledge": "Knowledge Base",
  "/search": "Smart Search",
  "/automation": "Local Automation",
  "/exports": "Exports",
  "/settings": "Settings",
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.keys(PAGE_TITLES).find(
    (key) => key !== "/" && pathname.startsWith(key),
  );
  return match ? PAGE_TITLES[match] : "LocalMind AI";
}

export function Topbar() {
  const pathname = usePathname();
  const setCommandOpen = useAppStore((s) => s.setCommandOpen);
  const { stats } = useSystemStats();

  const title = resolveTitle(pathname);
  const online = stats?.ollama?.online ?? false;
  const model = stats?.ollama?.model ?? "qwen2.5:3b";
  const cpu = stats ? round(stats.cpu_percent, 0) : null;
  const mem = stats ? round(stats.memory.percent, 0) : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <h2 className="truncate text-base font-semibold text-foreground">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command palette trigger */}
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="group flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="hidden items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        {/* System quick stats */}
        {cpu !== null && mem !== null ? (
          <div className="hidden items-center gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground lg:flex">
            <Tooltip content="CPU usage">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                <span
                  className={cn(cpu > 85 && "text-warning font-medium")}
                >
                  {cpu}%
                </span>
              </span>
            </Tooltip>
            <span className="h-3 w-px bg-border" />
            <Tooltip content="Memory usage">
              <span className="flex items-center gap-1.5">
                <MemoryStick className="h-3.5 w-3.5" />
                <span
                  className={cn(mem > 85 && "text-warning font-medium")}
                >
                  {mem}%
                </span>
              </span>
            </Tooltip>
          </div>
        ) : null}

        {/* Model + status */}
        <Tooltip content={online ? `Model: ${model}` : "Ollama offline"}>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[140px] truncate rounded-lg bg-secondary/50 px-2.5 py-1 text-xs font-medium text-foreground md:inline-block">
              {model}
            </span>
            <StatusPill
              online={online}
              label={online ? "Ready" : "Offline"}
            />
          </div>
        </Tooltip>
      </div>
    </header>
  );
}

export default Topbar;
