"use client";

import * as React from "react";
import { Workflow, Loader2, Play, Zap } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { AutomationTask } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCard } from "@/components/modules/TaskCard";
import { ResultPanel } from "@/components/modules/ResultPanel";

export default function AutomationPage() {
  const pushAction = useAppStore((s) => s.pushAction);

  const [tasks, setTasks] = React.useState<AutomationTask[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [listError, setListError] = React.useState<string | null>(null);

  const [activeTask, setActiveTask] = React.useState<AutomationTask | null>(
    null,
  );
  const [input, setInput] = React.useState("");
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [runError, setRunError] = React.useState<string | null>(null);

  const load = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await api.getAutomationTasks(signal);
      setTasks(data);
      setListError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setListError(
        err instanceof ApiError ? err.message : "Failed to load tasks.",
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

  const run = async () => {
    if (!activeTask) return;
    setRunning(true);
    setResult(null);
    setRunError(null);
    try {
      const res = await api.runAutomation({
        task: activeTask.id,
        input: input.trim() || undefined,
      });
      setResult(res.result);
      pushAction({
        id: Date.now(),
        action: activeTask.id,
        module: "automation",
        summary: `Ran "${activeTask.name}"`,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setRunError(
        err instanceof ApiError ? err.message : "Automation run failed.",
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Local Automation"
        description="Chain your local model into repeatable tasks — all executed privately on your device."
        icon={Workflow}
      />

      {listError ? (
        <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {listError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr]">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Available tasks
          </h3>
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={Workflow}
              title="No automation tasks"
              description="Your local automation catalog is empty right now."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  title={t.name}
                  description={t.description}
                  icon={Zap}
                  selected={activeTask?.id === t.id}
                  onClick={() => {
                    setActiveTask(t);
                    setResult(null);
                    setRunError(null);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <GlassCard className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {activeTask ? activeTask.name : "Configure"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {activeTask
                  ? activeTask.description
                  : "Select a task on the left to configure and run it."}
              </p>
            </div>
            <Textarea
              value={input}
              placeholder="Optional input for this task…"
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[140px]"
              disabled={!activeTask}
            />
            <div className="flex justify-end">
              <Button
                variant="gradient"
                onClick={run}
                disabled={!activeTask || running}
              >
                {running ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Run task
              </Button>
            </div>
          </GlassCard>

          <ResultPanel
            result={result}
            loading={running}
            error={runError}
            title="Output"
            loadingLabel="Running automation locally…"
            emptyLabel="Run a task to see its output here."
          />
        </div>
      </div>
    </div>
  );
}
