"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Sparkles, AlertTriangle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/shared/LoadingDots";

export interface ResultPanelProps {
  result?: string | null;
  loading?: boolean;
  error?: string | null;
  title?: string;
  loadingLabel?: string;
  emptyLabel?: string;
  className?: string;
  /** Optional download handler; when set, a download button appears. */
  onDownload?: () => void;
}

/**
 * Reusable AI-result surface used across module pages. Shows a loading state,
 * an error state, an empty prompt, or the generated result with a copy action.
 */
export function ResultPanel({
  result,
  loading = false,
  error,
  title = "Result",
  loadingLabel = "Generating with your local model…",
  emptyLabel = "Run an action to see the AI output here.",
  className,
  onDownload,
}: ResultPanelProps) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className={cn(
        "flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-border bg-card/60",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {result && !loading ? (
          <div className="flex items-center gap-1.5">
            {onDownload ? (
              <Button size="sm" variant="ghost" onClick={onDownload}>
                <Download className="h-3.5 w-3.5" />
                Save
              </Button>
            ) : null}
            <Button size="sm" variant="ghost" onClick={copy}>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="relative flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-3 py-10 text-muted-foreground"
            >
              <LoadingDots className="text-primary" />
              <p className="text-sm">{loadingLabel}</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          ) : result ? (
            <motion.pre
              key="result"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground"
            >
              {result}
            </motion.pre>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full items-center justify-center py-10 text-center text-sm text-muted-foreground"
            >
              {emptyLabel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ResultPanel;
