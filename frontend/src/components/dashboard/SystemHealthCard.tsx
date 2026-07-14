"use client";

import * as React from "react";
import { Activity, Cpu, HardDrive, MemoryStick } from "lucide-react";
import type { SystemStats } from "@/lib/types";
import { GlassCard } from "@/components/shared/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceMeter } from "@/components/dashboard/ResourceMeter";

export interface SystemHealthCardProps {
  stats: SystemStats | null;
  loading?: boolean;
  error?: string | null;
}

const HEALTH_META: Record<
  SystemStats["health"],
  { label: string; variant: "success" | "warning" | "default" }
> = {
  healthy: { label: "Healthy", variant: "success" },
  degraded: { label: "Degraded", variant: "warning" },
  offline: { label: "Offline", variant: "default" },
};

export function SystemHealthCard({
  stats,
  loading = false,
  error,
}: SystemHealthCardProps) {
  const health = stats ? HEALTH_META[stats.health] : HEALTH_META.offline;

  return (
    <GlassCard className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            System Health
          </h3>
        </div>
        {loading && !stats ? (
          <Skeleton className="h-5 w-16 rounded-full" />
        ) : (
          <Badge variant={health.variant}>{health.label}</Badge>
        )}
      </div>

      {error && !stats ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : loading && !stats ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : stats ? (
        <div className="space-y-4">
          <ResourceMeter
            label="CPU"
            icon={Cpu}
            percent={stats.cpu_percent}
            detail={`${Math.round(stats.cpu_percent)}%`}
          />
          <ResourceMeter
            label="Memory"
            icon={MemoryStick}
            percent={stats.memory.percent}
            detail={`${stats.memory.used_gb.toFixed(1)} / ${stats.memory.total_gb.toFixed(1)} GB`}
          />
          <ResourceMeter
            label="Disk"
            icon={HardDrive}
            percent={stats.disk.percent}
            detail={`${stats.disk.used_gb.toFixed(1)} / ${stats.disk.total_gb.toFixed(1)} GB`}
          />
        </div>
      ) : null}
    </GlassCard>
  );
}

export default SystemHealthCard;
