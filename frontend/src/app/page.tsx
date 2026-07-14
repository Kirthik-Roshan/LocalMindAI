"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  NotebookPen,
  Sparkles,
  Boxes,
  RefreshCw,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { DashboardOverview } from "@/lib/types";
import { useSystemStats } from "@/hooks/useSystemStats";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { ModelStatusCard } from "@/components/dashboard/ModelStatusCard";
import { SystemHealthCard } from "@/components/dashboard/SystemHealthCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { stats, loading: statsLoading } = useSystemStats();
  const [overview, setOverview] = React.useState<DashboardOverview | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await api.getDashboard(signal);
      setOverview(data);
      setError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(
        err instanceof ApiError ? err.message : "Failed to load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const s = overview?.stats;

  return (
    <div>
      <PageHeader
        title={`${greeting()} 👋`}
        description="Your private, offline AI workspace — everything runs locally on your machine."
        icon={LayoutDashboard}
        actions={
          <Button
            variant="outline"
            onClick={() => load()}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        }
      />

      {error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </motion.div>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          index={0}
          label="Documents"
          value={s?.documents ?? 0}
          icon={FileText}
          hint="Indexed & searchable"
          loading={loading && !overview}
        />
        <StatCard
          index={1}
          label="Notes"
          value={s?.notes ?? 0}
          icon={NotebookPen}
          hint="In your workspace"
          loading={loading && !overview}
        />
        <StatCard
          index={2}
          label="AI Actions"
          value={s?.ai_actions ?? 0}
          icon={Sparkles}
          hint="Run locally"
          loading={loading && !overview}
        />
        <StatCard
          index={3}
          label="Indexed Chunks"
          value={s?.indexed_chunks ?? 0}
          icon={Boxes}
          hint="Vector embeddings"
          loading={loading && !overview}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ModelStatusCard stats={stats} loading={statsLoading} />
        </div>
        <SystemHealthCard stats={stats} loading={statsLoading} />
      </div>

      <div className="mb-6">
        <QuickActions />
      </div>

      <RecentActivity
        documents={overview?.recent_documents ?? []}
        actions={overview?.recent_actions ?? []}
        workspaces={overview?.recent_workspaces ?? []}
        loading={loading && !overview}
      />
    </div>
  );
}
