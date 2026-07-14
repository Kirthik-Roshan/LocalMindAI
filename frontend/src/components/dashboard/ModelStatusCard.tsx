"use client";

import * as React from "react";
import { Cpu, Database, FileStack, Boxes } from "lucide-react";
import type { SystemStats } from "@/lib/types";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { Skeleton } from "@/components/ui/skeleton";

export interface ModelStatusCardProps {
  stats: SystemStats | null;
  loading?: boolean;
}

/**
 * Shows the locally-installed model, Ollama online status, indexed files, and
 * on-disk storage breakdown. Reinforces the "runs on your machine" message.
 */
export function ModelStatusCard({
  stats,
  loading = false,
}: ModelStatusCardProps) {
  const online = stats?.ollama.online ?? false;

  const facts: { label: string; value: string; icon: typeof Cpu }[] = stats
    ? [
        {
          label: "Indexed files",
          value: String(stats.indexed_files),
          icon: FileStack,
        },
        {
          label: "Documents",
          value: String(stats.storage.documents),
          icon: Database,
        },
        {
          label: "Images",
          value: String(stats.storage.images),
          icon: Boxes,
        },
        {
          label: "Exports",
          value: String(stats.storage.exports),
          icon: FileStack,
        },
      ]
    : [];

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-brand opacity-15 blur-3xl" />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-sm">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Local AI Engine
            </h3>
            <p className="text-xs text-muted-foreground">
              Powered by Ollama · 100% offline
            </p>
          </div>
        </div>
        {loading && !stats ? (
          <Skeleton className="h-6 w-20 rounded-full" />
        ) : (
          <StatusPill online={online} />
        )}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-4">
        {loading && !stats ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          <>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Active model
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-foreground">
              {stats?.ollama.model || "—"}
            </p>
            {stats?.ollama.version ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Ollama v{stats.ollama.version}
              </p>
            ) : null}
          </>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {loading && !stats
          ? [0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))
          : facts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl border border-border bg-card/40 p-3"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <fact.icon className="h-3.5 w-3.5" />
                  <span className="text-xs">{fact.label}</span>
                </div>
                <p className="mt-1.5 text-xl font-bold text-foreground">
                  {fact.value}
                </p>
              </div>
            ))}
      </div>
    </GlassCard>
  );
}

export default ModelStatusCard;
