"use client";

import * as React from "react";
import {
  Settings as SettingsIcon,
  Cpu,
  Save,
  RotateCcw,
  Loader2,
  Check,
  Keyboard,
  Sparkles,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Settings } from "@/lib/types";
import { useSettingsStore, DEFAULT_SETTINGS } from "@/store/useSettingsStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const SELECTS: {
  key: keyof Settings;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "embedding_model",
    label: "Embedding model",
    options: [
      { value: "all-minilm", label: "all-minilm" },
      { value: "nomic-embed-text", label: "nomic-embed-text" },
      { value: "mxbai-embed-large", label: "mxbai-embed-large" },
    ],
  },
  {
    key: "ocr_engine",
    label: "OCR engine",
    options: [
      { value: "tesseract", label: "Tesseract" },
      { value: "easyocr", label: "EasyOCR" },
    ],
  },
  {
    key: "speech_engine",
    label: "Speech engine",
    options: [
      { value: "whisper", label: "Whisper" },
      { value: "faster-whisper", label: "faster-whisper" },
    ],
  },
  {
    key: "theme",
    label: "Theme",
    options: [
      { value: "dark", label: "Dark" },
      { value: "light", label: "Light" },
    ],
  },
  {
    key: "language",
    label: "Language",
    options: [
      { value: "en", label: "English" },
      { value: "es", label: "Spanish" },
      { value: "fr", label: "French" },
      { value: "de", label: "German" },
      { value: "hi", label: "Hindi" },
    ],
  },
];

const SHORTCUTS = [
  { keys: "⌘ K", label: "Open command palette" },
  { keys: "⌘ B", label: "Toggle sidebar" },
  { keys: "⌘ S", label: "Save note" },
  { keys: "Esc", label: "Close dialogs" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-xl border border-input bg-secondary/40 px-3.5 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-popover">
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function SettingsPage() {
  const store = useSettingsStore();
  const setStore = useSettingsStore((s) => s.set);
  const resetStore = useSettingsStore((s) => s.reset);

  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Hydrate from backend on mount (best-effort; store defaults win if offline).
  React.useEffect(() => {
    const controller = new AbortController();
    api
      .getSettings(controller.signal)
      .then((s) => setStore(s))
      .catch(() => {
        /* backend offline — keep persisted local settings */
      });
    return () => controller.abort();
  }, [setStore]);

  const current: Settings = {
    model: store.model,
    temperature: store.temperature,
    top_p: store.top_p,
    max_tokens: store.max_tokens,
    embedding_model: store.embedding_model,
    ocr_engine: store.ocr_engine,
    speech_engine: store.speech_engine,
    theme: store.theme,
    language: store.language,
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await api.updateSettings(current);
      setStore(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to save settings to the backend. Your preferences are saved locally.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Tune your local model, engines and workspace preferences. Stored locally and synced to the backend when available."
        icon={SettingsIcon}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => resetStore()}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button variant="gradient" onClick={save} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? "Saved" : "Save"}
            </Button>
          </div>
        }
      />

      {error ? (
        <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Model params */}
        <GlassCard className="space-y-5">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Model & Inference
            </h3>
          </div>

          <Field label="Chat model">
            <Input
              value={store.model}
              onChange={(e) => setStore({ model: e.target.value })}
              placeholder="qwen2.5:3b"
              className="font-mono"
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Temperature
              </label>
              <Badge variant="secondary">
                {store.temperature.toFixed(2)}
              </Badge>
            </div>
            <Slider
              min={0}
              max={2}
              step={0.05}
              value={store.temperature}
              onValueChange={(v) => setStore({ temperature: v })}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Top P
              </label>
              <Badge variant="secondary">{store.top_p.toFixed(2)}</Badge>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={store.top_p}
              onValueChange={(v) => setStore({ top_p: v })}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Max tokens
              </label>
              <Badge variant="secondary">{store.max_tokens}</Badge>
            </div>
            <Slider
              min={256}
              max={8192}
              step={128}
              value={store.max_tokens}
              onValueChange={(v) => setStore({ max_tokens: v })}
            />
          </div>
        </GlassCard>

        {/* Engines & preferences */}
        <GlassCard className="space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Engines & Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {SELECTS.map((sel) => (
              <Field key={sel.key} label={sel.label}>
                <Select
                  value={String(current[sel.key])}
                  options={sel.options}
                  onChange={(v) =>
                    setStore({ [sel.key]: v } as Partial<Settings>)
                  }
                />
              </Field>
            ))}
          </div>

          <Separator />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Keyboard shortcuts
              </h4>
            </div>
            <ul className="space-y-2">
              {SHORTCUTS.map((sc) => (
                <li
                  key={sc.keys}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{sc.label}</span>
                  <kbd className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 font-mono text-xs text-foreground">
                    {sc.keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Defaults: model {DEFAULT_SETTINGS.model} · temp{" "}
        {DEFAULT_SETTINGS.temperature} · embeddings{" "}
        {DEFAULT_SETTINGS.embedding_model}
      </p>
    </div>
  );
}
