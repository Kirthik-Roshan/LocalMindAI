"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ImageIcon,
  ScanText,
  Eye,
  Captions,
  Lightbulb,
  BarChart3,
  MonitorSmartphone,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ImageTask, ImageAnalyzeResult } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { FileDropzone, formatBytes } from "@/components/modules/FileDropzone";
import { ActionToolbar, type ActionItem } from "@/components/modules/ActionToolbar";
import { ResultPanel } from "@/components/modules/ResultPanel";

const TASKS: ActionItem<ImageTask>[] = [
  { value: "ocr", label: "Extract Text (OCR)", icon: ScanText },
  { value: "describe", label: "Describe", icon: Eye },
  { value: "caption", label: "Caption", icon: Captions },
  { value: "explain", label: "Explain", icon: Lightbulb },
  { value: "chart", label: "Read Chart", icon: BarChart3 },
  { value: "screenshot", label: "Screenshot", icon: MonitorSmartphone },
];

function resultText(res: ImageAnalyzeResult): string {
  return res.text || res.description || res.caption || "";
}

export default function ImagesPage() {
  const pushAction = useAppStore((s) => s.pushAction);

  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [task, setTask] = React.useState<ImageTask | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
    setTask(null);
  };

  const run = async (selected: ImageTask) => {
    setTask(selected);
    if (!file) {
      setError("Upload an image first.");
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.analyzeImage(file, selected);
      setResult(resultText(res) || "(No text returned.)");
      pushAction({
        id: Date.now(),
        action: selected,
        module: "images",
        summary: `${selected} on ${file.name}`,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Image analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Image Analysis"
        description="Run OCR, descriptions, captions and chart reading fully offline with your local vision pipeline."
        icon={ImageIcon}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <GlassCard className="space-y-4">
            {preview ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl border border-border bg-secondary/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <motion.img
                    key={preview}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={preview}
                    alt={file?.name ?? "Preview"}
                    className="max-h-[360px] w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file?.name}
                    </p>
                    {file ? (
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(file.size)}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (preview) URL.revokeObjectURL(preview);
                      setFile(null);
                      setPreview(null);
                      setResult(null);
                      setTask(null);
                    }}
                  >
                    Replace
                  </Button>
                </div>
              </div>
            ) : (
              <FileDropzone
                onFiles={onFiles}
                accept="image/*"
                title="Drop an image here"
                description="PNG, JPG, WEBP, screenshots or charts"
                icon={<ImageIcon className="h-7 w-7 text-white" />}
              />
            )}
          </GlassCard>

          <GlassCard className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Task</h3>
            <ActionToolbar
              actions={TASKS}
              value={task}
              onSelect={run}
              disabled={loading || !file}
            />
          </GlassCard>
        </div>

        <GlassCard>
          <ResultPanel
            result={result}
            loading={loading}
            error={error}
            title={task ? `Result · ${task}` : "Result"}
            loadingLabel="Analyzing image locally…"
            emptyLabel="Upload an image and choose a task to see the output."
            className="min-h-[420px] border-0"
          />
        </GlassCard>
      </div>
    </div>
  );
}
