"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PenLine,
  Plus,
  Trash2,
  Save,
  Wand2,
  Expand,
  ScrollText,
  Languages,
  Sparkles,
  FileBarChart,
  ListChecks,
  Table2,
  Mail,
  FileText,
  Clock3,
  RotateCcw,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Note, TransformAction } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ActionToolbar, type ActionItem } from "@/components/modules/ActionToolbar";
import { ResultPanel } from "@/components/modules/ResultPanel";
import { relativeTime } from "@/components/dashboard/RecentActivity";

const ACTIONS: ActionItem<TransformAction>[] = [
  { value: "improve", label: "Improve", icon: Sparkles },
  { value: "rewrite", label: "Rewrite", icon: Wand2 },
  { value: "expand", label: "Expand", icon: Expand },
  { value: "summarize", label: "Summarize", icon: ScrollText },
  { value: "translate", label: "Translate", icon: Languages },
  { value: "report", label: "Report", icon: FileBarChart },
  { value: "action_items", label: "Action Items", icon: ListChecks },
  { value: "table", label: "Table", icon: Table2 },
  { value: "email", label: "Email", icon: Mail },
  { value: "docs", label: "Docs", icon: FileText },
  { value: "minutes", label: "Minutes", icon: Clock3 },
];

export default function WorkspacePage() {
  const pushAction = useAppStore((s) => s.pushAction);

  const [notes, setNotes] = React.useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = React.useState(true);
  const [activeId, setActiveId] = React.useState<number | null>(null);

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [action, setAction] = React.useState<TransformAction | null>(null);
  const [transforming, setTransforming] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [tError, setTError] = React.useState<string | null>(null);
  const [tone, setTone] = React.useState("professional");
  const [language, setLanguage] = React.useState("Spanish");

  const [notesError, setNotesError] = React.useState<string | null>(null);

  const loadNotes = React.useCallback(async (signal?: AbortSignal) => {
    setNotesLoading(true);
    try {
      const data = await api.getNotes(signal);
      setNotes(data);
      setNotesError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setNotesError(
        err instanceof ApiError ? err.message : "Failed to load notes.",
      );
    } finally {
      setNotesLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    loadNotes(controller.signal);
    return () => controller.abort();
  }, [loadNotes]);

  const selectNote = (note: Note) => {
    setActiveId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setDirty(false);
    setResult(null);
    setTError(null);
  };

  const newNote = () => {
    setActiveId(null);
    setTitle("");
    setContent("");
    setDirty(false);
    setResult(null);
    setTError(null);
  };

  const save = async () => {
    if (!title.trim() && !content.trim()) return;
    setSaving(true);
    try {
      if (activeId === null) {
        const created = await api.createNote({
          title: title.trim() || "Untitled note",
          content,
        });
        setNotes((prev) => [created, ...prev]);
        setActiveId(created.id);
      } else {
        const updated = await api.updateNote(activeId, { title, content });
        setNotes((prev) =>
          prev.map((n) => (n.id === updated.id ? updated : n)),
        );
      }
      setDirty(false);
    } catch (err) {
      setNotesError(
        err instanceof ApiError ? err.message : "Failed to save note.",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await api.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (activeId === id) newNote();
    } catch (err) {
      setNotesError(
        err instanceof ApiError ? err.message : "Failed to delete note.",
      );
    }
  };

  const runTransform = async (selected: TransformAction) => {
    setAction(selected);
    if (!content.trim()) {
      setTError("Write some text first, then apply an action.");
      setResult(null);
      return;
    }
    setTransforming(true);
    setResult(null);
    setTError(null);
    try {
      const options =
        selected === "translate"
          ? { language }
          : selected === "rewrite" || selected === "improve" || selected === "email"
            ? { tone }
            : undefined;
      const res = await api.transform({
        text: content,
        action: selected,
        options,
      });
      setResult(res.result);
      pushAction({
        id: Date.now(),
        action: selected,
        module: "workspace",
        summary: `${selected} on "${title || "note"}"`,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setTError(
        err instanceof ApiError ? err.message : "Transform failed.",
      );
    } finally {
      setTransforming(false);
    }
  };

  const applyResult = () => {
    if (!result) return;
    setContent(result);
    setDirty(true);
    setResult(null);
  };

  const showTone =
    action === "rewrite" || action === "improve" || action === "email";
  const showLang = action === "translate";

  return (
    <div>
      <PageHeader
        title="AI Workspace"
        description="Draft notes and reshape them inline with your local model — rewrite, summarize, translate, and more."
        icon={PenLine}
        actions={
          <Button variant="gradient" onClick={newNote}>
            <Plus className="h-4 w-4" />
            New note
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr]">
        {/* Notes list */}
        <GlassCard className="flex max-h-[calc(100vh-220px)] flex-col p-0">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              Your Notes
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {notesLoading ? (
              <div className="space-y-2 p-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <EmptyState
                icon={PenLine}
                title="No notes yet"
                description="Create your first note to begin."
                className="border-0 py-10"
              />
            ) : (
              <ul className="space-y-1">
                {notes.map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={() => selectNote(note)}
                      className={`group flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        activeId === note.id
                          ? "bg-primary/10 ring-1 ring-primary/30"
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {note.title || "Untitled note"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {relativeTime(note.updated_at)}
                        </p>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label="Delete note"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(note.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            remove(note.id);
                          }
                        }}
                        className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </GlassCard>

        {/* Editor + transforms */}
        <div className="space-y-5">
          {notesError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {notesError}
            </div>
          ) : null}

          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={title}
                placeholder="Note title…"
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
                className="flex-1 border-0 bg-transparent px-0 text-lg font-semibold focus-visible:ring-0"
              />
              {dirty ? <Badge variant="warning">Unsaved</Badge> : null}
              <Button
                variant="secondary"
                onClick={save}
                disabled={saving || (!title.trim() && !content.trim())}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
            <Textarea
              value={content}
              placeholder="Start writing… then choose an AI action below to transform your text."
              onChange={(e) => {
                setContent(e.target.value);
                setDirty(true);
              }}
              className="min-h-[240px] text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span>{content.length} chars</span>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                AI Actions
              </h3>
            </div>
            <ActionToolbar
              actions={ACTIONS}
              value={action}
              onSelect={runTransform}
              disabled={transforming}
            />

            <AnimatePresence>
              {showTone ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-2 overflow-hidden"
                >
                  <span className="text-xs text-muted-foreground">Tone:</span>
                  {["professional", "casual", "friendly", "concise", "formal"].map(
                    (t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`rounded-lg border px-2.5 py-1 text-xs capitalize transition-colors ${
                          tone === t
                            ? "border-primary/50 bg-primary/15 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    ),
                  )}
                </motion.div>
              ) : null}
              {showLang ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-2 overflow-hidden"
                >
                  <span className="text-xs text-muted-foreground">
                    Language:
                  </span>
                  {["Spanish", "French", "German", "Japanese", "Hindi"].map(
                    (l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLanguage(l)}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                          language === l
                            ? "border-primary/50 bg-primary/15 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {l}
                      </button>
                    ),
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <ResultPanel
              result={result}
              loading={transforming}
              error={tError}
              title={action ? `Result · ${action}` : "Result"}
              emptyLabel="Select an action above to transform your note."
            />

            {result && !transforming ? (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setResult(null)}>
                  <RotateCcw className="h-4 w-4" />
                  Discard
                </Button>
                <Button variant="gradient" onClick={applyResult}>
                  <Save className="h-4 w-4" />
                  Apply to note
                </Button>
              </div>
            ) : null}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
