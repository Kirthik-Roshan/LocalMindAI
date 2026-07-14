"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { useAppStore } from "@/store/useAppStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const theme = useSettingsStore((s) => s.theme);

  // Reflect persisted theme onto the document root.
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [theme]);

  return (
    <div className="relative min-h-screen app-bg">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <Sidebar />
      <div
        className={cn(
          "relative flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out",
          collapsed ? "pl-[76px]" : "pl-[264px]",
        )}
      >
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}

export default AppShell;
