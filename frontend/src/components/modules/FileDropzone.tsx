"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface FileDropzoneProps {
  /** Called with the selected files (multiple allowed when `multiple` is true). */
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

/** Human-friendly byte formatting shared across module pages. */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function FileDropzone({
  onFiles,
  accept,
  multiple = false,
  disabled = false,
  className,
  title = "Drop a file here",
  description = "or click to browse from your device",
  icon,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const handleFiles = React.useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const files = Array.from(list);
      onFiles(multiple ? files : [files[0]]);
    },
    [multiple, onFiles],
  );

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        disabled={disabled}
      />
      <motion.button
        type="button"
        whileHover={disabled ? undefined : { scale: 1.005 }}
        whileTap={disabled ? undefined : { scale: 0.995 }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        disabled={disabled}
        className={cn(
          "group relative flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200",
          dragging
            ? "border-primary bg-primary/10"
            : "border-border bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-sm transition-transform duration-200",
            dragging && "scale-110",
          )}
        >
          {icon ?? <UploadCloud className="h-7 w-7 text-white" />}
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </motion.button>
    </div>
  );
}

export interface FilePreviewProps {
  name: string;
  size?: number;
  onRemove?: () => void;
  className?: string;
}

export function FilePreview({
  name,
  size,
  onRemove,
  className,
}: FilePreviewProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5",
        className,
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <FileIcon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        {size !== undefined ? (
          <p className="text-xs text-muted-foreground">{formatBytes(size)}</p>
        ) : null}
      </div>
      {onRemove ? (
        <Button size="icon" variant="ghost" onClick={onRemove} aria-label="Remove file">
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

export default FileDropzone;
