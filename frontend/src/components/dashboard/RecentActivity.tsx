"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Sparkles,
  NotebookPen,
  Clock,
  type LucideIcon,
} from "lucide-react";
import type {
  RecentAction,
  RecentDocument,
  RecentWorkspace,
} from "@/lib/types";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

/** Compact relative-time formatter ("3m ago", "2h ago", "Apr 3"). */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(then).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

interface ActivityListProps {
  title: string;
  icon: LucideIcon;
  loading?: boolean;
  emptyLabel: string;
  children?: React.ReactNode;
  isEmpty: boolean;
  action?: React.ReactNode;
}

function ActivityShell({
  title,
  icon: Icon,
  loading,
  emptyLabel,
  isEmpty,
  children,
  action,
}: ActivityListProps) {
  return (
    <GlassCard className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {action}
      </div>
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={Icon}
          title="Nothing yet"
          description={emptyLabel}
          className="border-0 py-8"
        />
      ) : (
        <ul className="space-y-1">{children}</ul>
      )}
    </GlassCard>
  );
}

function Row({
  href,
  icon: Icon,
  primary,
  secondary,
  time,
  index,
}: {
  href: string;
  icon: LucideIcon;
  primary: string;
  secondary?: string;
  time: string;
  index: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-secondary/50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {primary}
          </p>
          {secondary ? (
            <p className="truncate text-xs text-muted-foreground">
              {secondary}
            </p>
          ) : null}
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {time}
        </span>
      </Link>
    </motion.li>
  );
}

export interface RecentActivityProps {
  documents: RecentDocument[];
  actions: RecentAction[];
  workspaces: RecentWorkspace[];
  loading?: boolean;
}

export function RecentActivity({
  documents,
  actions,
  workspaces,
  loading = false,
}: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <ActivityShell
        title="Recent Documents"
        icon={FileText}
        loading={loading}
        isEmpty={documents.length === 0}
        emptyLabel="Upload a document to get started."
      >
        {documents.map((doc, i) => (
          <Row
            key={doc.id}
            href="/documents"
            icon={FileText}
            primary={doc.name}
            secondary={doc.type.toUpperCase()}
            time={relativeTime(doc.created_at)}
            index={i}
          />
        ))}
      </ActivityShell>

      <ActivityShell
        title="Recent AI Actions"
        icon={Sparkles}
        loading={loading}
        isEmpty={actions.length === 0}
        emptyLabel="Your AI activity will appear here."
      >
        {actions.map((act, i) => (
          <Row
            key={act.id}
            href="/workspace"
            icon={Sparkles}
            primary={act.summary || act.action}
            secondary={act.module}
            time={relativeTime(act.created_at)}
            index={i}
          />
        ))}
      </ActivityShell>

      <ActivityShell
        title="Recent Workspaces"
        icon={NotebookPen}
        loading={loading}
        isEmpty={workspaces.length === 0}
        emptyLabel="Create a note in the AI Workspace."
      >
        {workspaces.map((ws, i) => (
          <Row
            key={ws.id}
            href="/workspace"
            icon={NotebookPen}
            primary={ws.title || "Untitled note"}
            time={relativeTime(ws.updated_at)}
            index={i}
          />
        ))}
      </ActivityShell>
    </div>
  );
}

export default RecentActivity;
