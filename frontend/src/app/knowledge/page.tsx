"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Library,
  Search,
  Sparkles,
  FileText,
  Loader2,
  Boxes,
  Quote,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type {
  KnowledgeResult,
  KnowledgeAskResponse,
} from "@/lib/types";
import { useSystemStats } from "@/hooks/useSystemStats";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingDots } from "@/components/shared/LoadingDots";

export default function KnowledgePage() {
  const { stats } = useSystemStats();
  const [tab, setTab] = React.useState<"ask" | "search">("ask");

  const [query, setQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<
    KnowledgeResult[] | null
  >(null);
  const [answer, setAnswer] = React.useState<KnowledgeAskResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setSearchResults(null);
    try {
      if (tab === "ask") {
        const res = await api.knowledgeAsk(query);
        setAnswer(res);
      } else {
        const res = await api.knowledgeSearch(query, 8);
        setSearchResults(res.results);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        description="Semantic search and question-answering over everything you've indexed — grounded in your own files."
        icon={Library}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Boxes className="mr-1 h-3 w-3" />
              {stats?.indexed_files ?? 0} files
            </Badge>
          </div>
        }
      />

      <div className="mx-auto max-w-3xl space-y-6">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "ask" | "search")}
        >
          <TabsList>
            <TabsTrigger value="ask">
              <Sparkles className="h-4 w-4" />
              Ask
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="h-4 w-4" />
              Semantic Search
            </TabsTrigger>
          </TabsList>

          <GlassCard className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={query}
                placeholder={
                  tab === "ask"
                    ? "Ask a question about your knowledge base…"
                    : "Search across indexed chunks…"
                }
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
                ) : tab === "ask" ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {tab === "ask" ? "Ask" : "Search"}
              </Button>
            </div>
          </GlassCard>

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <TabsContent value="ask">
            {loading ? (
              <GlassCard className="flex items-center justify-center py-10">
                <LoadingDots className="text-primary" label="Thinking locally…" />
              </GlassCard>
            ) : answer ? (
              <div className="space-y-4">
                <GlassCard className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Answer
                    </h3>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {answer.answer}
                  </p>
                </GlassCard>

                {answer.sources.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Sources
                    </p>
                    {answer.sources.map((src, i) => (
                      <motion.div
                        key={`${src.document_id}-${i}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-3 rounded-xl border border-border bg-card/50 p-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {src.source}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {src.snippet}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="Ask your knowledge base"
                description="Get grounded answers with citations from your indexed documents."
              />
            )}
          </TabsContent>

          <TabsContent value="search">
            {loading ? (
              <GlassCard className="flex items-center justify-center py-10">
                <LoadingDots className="text-primary" label="Searching…" />
              </GlassCard>
            ) : searchResults ? (
              searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((res, i) => (
                    <motion.div
                      key={`${res.document_id}-${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <GlassCard className="space-y-2 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Quote className="h-3.5 w-3.5 text-primary" />
                            <span className="truncate text-sm font-medium text-foreground">
                              {res.source}
                            </span>
                          </div>
                          <Badge variant="secondary">
                            {(res.score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {res.text}
                        </p>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Search}
                  title="No matches"
                  description="Try a different query or index more documents."
                />
              )
            ) : (
              <EmptyState
                icon={Search}
                title="Semantic search"
                description="Find the most relevant passages across your indexed content."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
