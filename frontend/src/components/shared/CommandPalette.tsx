"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Home,
  Image as ImageIcon,
  Loader2,
  Mic,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Sparkles,
  Zap,
  Database,
  Download,
  CornerDownLeft,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { SearchResult } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface NavCommand {
  label: string;
  href: string;
  icon: typeof Home;
  keywords: string;
}

const NAV_COMMANDS: NavCommand[] = [
  { label: "Dashboard", href: "/", icon: Home, keywords: "home overview" },
  {
    label: "AI Workspace",
    href: "/workspace",
    icon: Sparkles,
    keywords: "write transform rewrite notes",
  },
  {
    label: "Document Intelligence",
    href: "/documents",
    icon: FileText,
    keywords: "docs files pdf analyze",
  },
  {
    label: "Image Analysis",
    href: "/images",
    icon: ImageIcon,
    keywords: "ocr caption describe vision",
  },
  {
    label: "Voice Assistant",
    href: "/voice",
    icon: Mic,
    keywords: "transcribe speech command",
  },
  {
    label: "Knowledge Base",
    href: "/knowledge",
    icon: Database,
    keywords: "rag search ask vectors",
  },
  {
    label: "Smart Search",
    href: "/search",
    icon: SearchIcon,
    keywords: "find query",
  },
  {
    label: "Local Automation",
    href: "/automation",
    icon: Zap,
    keywords: "tasks workflow run",
  },
  {
    label: "Exports",
    href: "/exports",
    icon: Download,
    keywords: "pdf docx download files",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    keywords: "config model preferences",
  },
];

export function CommandPalette() {
  const router = useRouter();
  const open = useAppStore((s) => s.commandOpen);
  const setOpen = useAppStore((s) => s.setCommandOpen);

  const [mounted, setMounted] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 250);

  React.useEffect(() => setMounted(true), []);

  // Global ⌘K / Ctrl+K listener.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Reset when opened + focus input; lock scroll.
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(t);
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Remote search.
  React.useEffect(() => {
    if (!open) return;
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .search(trimmed)
      .then((res) => {
        if (!cancelled) setResults(res.results ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setResults([]);
          if (!(err instanceof ApiError)) {
            // swallow — search failures show as "no results"
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open]);

  const filteredNav = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_COMMANDS;
    return NAV_COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.keywords.toLowerCase().includes(q),
    );
  }, [query]);

  type FlatItem =
    | { kind: "nav"; nav: NavCommand }
    | { kind: "result"; result: SearchResult };

  const flatItems = React.useMemo<FlatItem[]>(() => {
    const nav: FlatItem[] = filteredNav.map((n) => ({ kind: "nav", nav: n }));
    const res: FlatItem[] = results.map((r) => ({
      kind: "result",
      result: r,
    }));
    return [...nav, ...res];
  }, [filteredNav, results]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [flatItems.length]);

  const go = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router, setOpen],
  );

  const selectItem = React.useCallback(
    (item: FlatItem) => {
      if (item.kind === "nav") {
        go(item.nav.href);
      } else {
        const moduleHref = item.result.module?.startsWith("/")
          ? item.result.module
          : `/${item.result.module ?? ""}`;
        go(moduleHref === "/" ? "/" : moduleHref);
      }
    },
    [go],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flatItems[activeIndex];
      if (item) selectItem(item);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl glass-strong shadow-glow"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search or jump to…"
                className="h-14 w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {loading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
              ) : (
                <kbd className="hidden shrink-0 rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
                  ESC
                </kbd>
              )}
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {flatItems.length === 0 ? (
                <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                  {query.trim().length >= 2 && !loading
                    ? "No results found."
                    : "Type to search across your workspace."}
                </div>
              ) : (
                <>
                  {filteredNav.length > 0 ? (
                    <div className="mb-1 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Navigation
                    </div>
                  ) : null}
                  {flatItems.map((item, idx) => {
                    const active = idx === activeIndex;
                    if (item.kind === "nav") {
                      const Icon = item.nav.icon;
                      return (
                        <button
                          key={`nav-${item.nav.href}`}
                          type="button"
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => selectItem(item)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                            active
                              ? "bg-primary/15 text-foreground"
                              : "text-muted-foreground hover:bg-secondary/60",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-foreground">
                            {item.nav.label}
                          </span>
                          {active ? (
                            <CornerDownLeft className="h-3.5 w-3.5 opacity-60" />
                          ) : (
                            <ArrowRight className="h-3.5 w-3.5 opacity-0" />
                          )}
                        </button>
                      );
                    }
                    const r = item.result;
                    return (
                      <div key={`res-${r.module}-${r.id}-${idx}`}>
                        {idx > 0 &&
                        flatItems[idx - 1]?.kind === "nav" ? (
                          <div className="mb-1 mt-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Results
                          </div>
                        ) : null}
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => selectItem(item)}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                            active
                              ? "bg-primary/15"
                              : "hover:bg-secondary/60",
                          )}
                        >
                          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-foreground">
                              {r.title}
                            </span>
                            {r.snippet ? (
                              <span className="block truncate text-xs text-muted-foreground">
                                {r.snippet}
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            {r.type}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export default CommandPalette;
