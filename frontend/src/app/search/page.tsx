"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search as SearchIcon,
  Loader2,
  FileText,
  NotebookPen,
  ImageIcon,
  Sparkles,
  Workflow,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { SearchResult } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const TYPE_FILTERS = [
  { value: "notes", label: "Notes" },
  { value: "files", label: "Files" },
  { value: "documents", label: "Documents" },
  { value: "images", label: "Images" },
  { value: "actions", label: "Actions" },
];

const TYPE_META: Record<
  string,
  { icon: LucideIcon; href: string }
> = {
  notes: { icon: NotebookPen, href: "/workspace" },
  note: { icon: NotebookPen, href: "/workspace" },
  files: { icon: FileText, href: "/documents" },
  documents: { icon: FileText, href: "/documents" },
  document: { icon: FileText, href: "/documents" },
  images: { icon: ImageIcon, href: "/images" },
  image: { icon: ImageIcon, href: "/images" },
  actions: { icon: Sparkles, href: "/workspace" },
  action: { icon: Sparkles, href: "/workspace" },
  automation: { icon: Workflow, href: "/automation" },
};

function metaFor(type: string) {
  return TYPE_META[type.toLowerCase()] ?? { icon: SearchIcon, href: "/" };
}

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [results, setResults] = React.useState<SearchResult[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggleType = (value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    );
  };

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.search(
        query,
        selected.length > 0 ? selected : undefined,
      );
      setResults(res.results);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const grouped = React.useMemo(() => {
    if (!results) return [];
    const map = new Map<string, SearchResult[]>();
    for (const r of results) {
      const key = r.type || "other";
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [results]);

  return (
    <div>
      <PageHeader
        title="Smart Search"
        description="One semantic query across notes, documents, images and AI actions — everything indexed on your machine."
        icon={SearchIcon}
      />

      <div className="mx-auto max-w-3xl space-y-5">
        <GlassCard className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              placeholder="Search everything…"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") run();
              }}
              className="flex-1"
            />
            <Button
              variant="gradient"
              onClick={run}
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => toggleType(f.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected.includes(f.value)
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </GlassCard>

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? (
          <GlassCard className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </GlassCard>
        ) : results ? (
          results.length > 0 ? (
            <div className="space-y-6">
              {grouped.map(([type, items]) => {
                const { icon: Icon } = metaFor(type);
                return (
                  <div key={type}>
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold capitalize text-foreground">
                        {type}
                      </h3>
                      <Badge variant="secondary">{items.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {items.map((r, i) => {
                        const { icon: RowIcon, href } = metaFor(r.type);
                        return (
                          <motion.div
                            key={`${r.type}-${r.id}-${i}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                          >
                            <Link
                              href={r.module || href}
                              className="group flex items-start gap-3 rounded-xl border border-border bg-card/50 p-3.5 transition-colors hover:border-primary/40 hover:bg-card"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-primary">
                                <RowIcon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-medium text-foreground">
                                    {r.title}
                                  </p>
                                  <Badge variant="secondary" className="shrink-0">
                                    {(r.score * 100).toFixed(0)}%
                                  </Badge>
                                </div>
                                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                  {r.snippet}
                                </p>
                              </div>
                              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={SearchIcon}
              title="No results"
              description="Nothing matched your query. Try broader terms or index more content."
            />
          )
        ) : (
          <EmptyState
            icon={SearchIcon}
            title="Search across your workspace"
            description="Find notes, documents, images and past AI actions in one place."
          />
        )}
      </div>
    </div>
  );
}
