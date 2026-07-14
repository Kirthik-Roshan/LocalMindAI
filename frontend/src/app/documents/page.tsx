"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Trash2,
  ScrollText,
  ListChecks,
  Users,
  CalendarClock,
  FileBarChart,
  MessagesSquare,
  GitCompareArrows,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { DocumentItem, DocumentAnalyzeTask } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDropzone, formatBytes } from "@/components/modules/FileDropzone";
import { ActionToolbar, type ActionItem } from "@/components/modules/ActionToolbar";
import { ResultPanel } from "@/components/modules/ResultPanel";
import { relativeTime } from "@/components/dashboard/RecentActivity";

const TASKS: ActionItem<DocumentAnalyzeTask>[] = [
  { value: "summary", label: "Summary", icon: ScrollText },
  { value: "key_points", label: "Key Points", icon: ListChecks },
  { value: "entities", label: "Entities", icon: Users },
  { value: "timeline", label: "Timeline", icon: CalendarClock },
  { value: "executive_summary", label: "Executive", icon: FileBarChart },
  { value: "qa", label: "Q&A", icon: MessagesSquare },
];

export default function DocumentsPage() {
  const pushAction = useAppStore((s) => s.pushAction);

  const [docs, setDocs] = React.useState<DocumentItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [listError, setListError] = React.useState<string | null>(null);

  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const [activeId, setActiveId] = React.useState<number | null>(null);
  const [task, setTask] = React.useState<DocumentAnalyzeTask | null>(null);
  const [question, setQuestion] = React.useState("");
  const [analyzing, setAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = React.useState<string | null>(null);

  const [compareIds, setCompareIds] = React.useState<number[]>([]);
  const [comparing, setComparing] = React.useState(false);

  const load = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await api.getDocuments(signal);
      setDocs(data);
      setListError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setListError(
        err instanceof ApiError ? err.message : "Failed to load documents.",
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

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    setUploadError(null);
    try {
      for (const file of files) {
        const created = await api.uploadDocument(file);
        setDocs((prev) => [created, ...prev]);
        pushAction({
          id: Date.now(),
          action: "upload",
          module: "documents",
          summary: `Uploaded ${created.name}`,
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      setUploadError(
        err instanceof ApiError ? err.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await api.deleteDocument(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      setCompareIds((prev) => prev.filter((c) => c !== id));
      if (activeId === id) {
        setActiveId(null);
        setResult(null);
      }
    } catch (err) {
      setListError(
        err instanceof ApiError ? err.message : "Failed to delete document.",
      );
    }
  };

  const runAnalyze = async (selected: DocumentAnalyzeTask) => {
    if (activeId === null) return;
    setTask(selected);
    if (selected === "qa" && !question.trim()) {
      setAnalyzeError("Enter a question for Q&A.");
      setResult(null);
      return;
    }
    setAnalyzing(true);
    setResult(null);
    setAnalyzeError(null);
    try {
      const res = await api.analyzeDocument(activeId, {
        task: selected,
        question: selected === "qa" ? question : undefined,
      });
      setResult(res.result);
      pushAction({
        id: Date.now(),
        action: selected,
        module: "documents",
        summary: `Analyzed document #${activeId} · ${selected}`,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setAnalyzeError(
        err instanceof ApiError ? err.message : "Analysis failed.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleCompare = (id: number) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const runCompare = async () => {
    if (compareIds.length < 2) return;
    setComparing(true);
    setResult(null);
    setAnalyzeError(null);
    setActiveId(null);
    setTask(null);
    try {
      const res = await api.compareDocuments(compareIds);
      setResult(res.result);
      pushAction({
        id: Date.now(),
        action: "compare",
        module: "documents",
        summary: `Compared ${compareIds.length} documents`,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setAnalyzeError(
        err instanceof ApiError ? err.message : "Comparison failed.",
      );
    } finally {
      setComparing(false);
    }
  };

  const activeDoc = docs.find((d) => d.id === activeId) ?? null;

  return (
    <div>
      <PageHeader
        title="Document Intelligence"
        description="Upload documents, auto-index them locally, and extract summaries, entities, timelines and answers."
        icon={FileText}
        actions={
          compareIds.length >= 2 ? (
            <Button
              variant="gradient"
              onClick={runCompare}
              disabled={comparing}
            >
              {comparing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GitCompareArrows className="h-4 w-4" />
              )}
              Compare {compareIds.length}
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Left: upload + list */}
        <div className="space-y-5">
          <GlassCard className="space-y-3">
            <FileDropzone
              onFiles={handleUpload}
              multiple
              disabled={uploading}
              accept=".pdf,.docx,.txt,.md,.csv"
              title={uploading ? "Uploading…" : "Drop documents here"}
              description="PDF, DOCX, TXT, MD, CSV — indexed locally into ChromaDB"
            />
            {uploadError ? (
              <p className="text-sm text-destructive">{uploadError}</p>
            ) : null}
          </GlassCard>

          <GlassCard className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                Library
              </h3>
              <Badge variant="secondary">{docs.length}</Badge>
            </div>
            <div className="max-h-[540px] overflow-auto p-2">
              {loading ? (
                <div className="space-y-2 p-2">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : listError ? (
                <p className="p-4 text-sm text-destructive">{listError}</p>
              ) : docs.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No documents yet"
                  description="Upload a file to analyze it with your local AI."
                  className="border-0 py-10"
                />
              ) : (
                <ul className="space-y-1">
                  {docs.map((doc) => {
                    const inCompare = compareIds.includes(doc.id);
                    return (
                      <li key={doc.id}>
                        <div
                          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                            activeId === doc.id
                              ? "bg-primary/10 ring-1 ring-primary/30"
                              : "hover:bg-secondary/50"
                          }`}
                        >
                          <button
                            type="button"
                            aria-label="Toggle compare"
                            onClick={() => toggleCompare(doc.id)}
                            className="shrink-0 text-muted-foreground hover:text-primary"
                          >
                            {inCompare ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveId(doc.id);
                              setResult(null);
                              setTask(null);
                              setAnalyzeError(null);
                            }}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {doc.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {doc.type.toUpperCase()} · {formatBytes(doc.size)}
                                {doc.pages ? ` · ${doc.pages}p` : ""} ·{" "}
                                {relativeTime(doc.created_at)}
                              </p>
                            </div>
                          </button>
                          <button
                            type="button"
                            aria-label="Delete document"
                            onClick={() => remove(doc.id)}
                            className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right: analysis */}
        <div className="space-y-5">
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Analyze
                </h3>
                <p className="text-xs text-muted-foreground">
                  {activeDoc
                    ? `Working with "${activeDoc.name}"`
                    : "Select a document from the library"}
                </p>
              </div>
            </div>

            <ActionToolbar
              actions={TASKS}
              value={task}
              onSelect={runAnalyze}
              disabled={activeId === null || analyzing}
            />

            {task === "qa" ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
              >
                <Input
                  value={question}
                  placeholder="Ask a question about this document…"
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runAnalyze("qa");
                  }}
                />
                <Button
                  variant="secondary"
                  onClick={() => runAnalyze("qa")}
                  disabled={analyzing}
                >
                  Ask
                </Button>
              </motion.div>
            ) : null}

            <ResultPanel
              result={result}
              loading={analyzing || comparing}
              error={analyzeError}
              title={
                comparing
                  ? "Comparison"
                  : task
                    ? `Result · ${task}`
                    : "Result"
              }
              loadingLabel={
                comparing
                  ? "Comparing documents locally…"
                  : "Analyzing with your local model…"
              }
              emptyLabel={
                activeId === null && compareIds.length < 2
                  ? "Pick a document and choose an analysis task."
                  : "Choose an analysis task above."
              }
              className="min-h-[320px]"
            />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
