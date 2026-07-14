import type {
  AutomationRunPayload,
  AutomationRunResult,
  AutomationTask,
  DashboardOverview,
  DeletedResponse,
  DocumentAnalyzePayload,
  DocumentAnalyzeResult,
  DocumentCompareResult,
  DocumentItem,
  ExportCreatePayload,
  ExportItem,
  HealthResponse,
  ImageAnalyzeResult,
  ImageTask,
  KnowledgeAskResponse,
  KnowledgeSearchResponse,
  ModelInfo,
  ModelPullResponse,
  ModelsResponse,
  Note,
  NoteCreatePayload,
  NoteUpdatePayload,
  SearchResponse,
  Settings,
  SettingsUpdate,
  SystemStats,
  TransformPayload,
  TransformResult,
  VoiceCommandResult,
  VoiceTranscribeResult,
} from "@/lib/types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const API_PREFIX = "/api/v1";

/**
 * Thrown by the fetch wrapper on any non-ok response or network failure.
 */
export class ApiError extends Error {
  status: number;
  offline: boolean;

  constructor(message: string, status = 0, offline = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.offline = offline;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** When true, the body is sent as-is (FormData) without JSON serialization. */
  raw?: boolean;
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.detail === "string") return data.detail;
    if (data && typeof data.message === "string") return data.message;
  } catch {
    /* ignore parse errors */
  }
  return `Request failed with status ${res.status}`;
}

/**
 * Resilient fetch wrapper. Prefixes the API base + version, serializes JSON,
 * and surfaces a friendly error when the backend is unreachable.
 */
async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, signal, raw = false } = options;

  const finalHeaders: Record<string, string> = { ...headers };
  let payload: BodyInit | undefined;

  if (body !== undefined && body !== null) {
    if (raw) {
      payload = body as BodyInit;
    } else {
      finalHeaders["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method,
      headers: finalHeaders,
      body: payload,
      signal,
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    throw new ApiError(
      "Cannot reach the LocalMind backend. Make sure the server is running on " +
        API_BASE +
        ".",
      0,
      true,
    );
  }

  if (!res.ok) {
    const detail = await parseError(res);
    throw new ApiError(detail, res.status, false);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  // Fallback: return text as unknown-typed value.
  return (await res.text()) as unknown as T;
}

/**
 * The typed API client. Every method returns a typed Promise and throws
 * ApiError on failure.
 */
export const api = {
  /* ---- Health ---- */
  getHealth(signal?: AbortSignal): Promise<HealthResponse> {
    return request<HealthResponse>("/health", { signal });
  },

  /* ---- System ---- */
  getSystemStats(signal?: AbortSignal): Promise<SystemStats> {
    return request<SystemStats>("/system/stats", { signal });
  },

  /* ---- Dashboard ---- */
  getDashboard(signal?: AbortSignal): Promise<DashboardOverview> {
    return request<DashboardOverview>("/dashboard/overview", { signal });
  },

  /* ---- Models ---- */
  getModels(signal?: AbortSignal): Promise<ModelsResponse> {
    return request<ModelsResponse>("/models", { signal });
  },

  pullModel(name: string): Promise<ModelPullResponse> {
    return request<ModelPullResponse>("/models/pull", {
      method: "POST",
      body: { name },
    });
  },

  /* ---- Workspace ---- */
  transform(payload: TransformPayload): Promise<TransformResult> {
    return request<TransformResult>("/workspace/transform", {
      method: "POST",
      body: payload,
    });
  },

  getNotes(signal?: AbortSignal): Promise<Note[]> {
    return request<Note[]>("/workspace/notes", { signal });
  },

  createNote(payload: NoteCreatePayload): Promise<Note> {
    return request<Note>("/workspace/notes", {
      method: "POST",
      body: payload,
    });
  },

  updateNote(id: number, payload: NoteUpdatePayload): Promise<Note> {
    return request<Note>(`/workspace/notes/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  deleteNote(id: number): Promise<DeletedResponse> {
    return request<DeletedResponse>(`/workspace/notes/${id}`, {
      method: "DELETE",
    });
  },

  /* ---- Documents ---- */
  uploadDocument(file: File): Promise<DocumentItem> {
    const form = new FormData();
    form.append("file", file);
    return request<DocumentItem>("/documents/upload", {
      method: "POST",
      body: form,
      raw: true,
    });
  },

  getDocuments(signal?: AbortSignal): Promise<DocumentItem[]> {
    return request<DocumentItem[]>("/documents", { signal });
  },

  getDocument(id: number, signal?: AbortSignal): Promise<DocumentItem> {
    return request<DocumentItem>(`/documents/${id}`, { signal });
  },

  analyzeDocument(
    id: number,
    payload: DocumentAnalyzePayload,
  ): Promise<DocumentAnalyzeResult> {
    return request<DocumentAnalyzeResult>(`/documents/${id}/analyze`, {
      method: "POST",
      body: payload,
    });
  },

  compareDocuments(ids: number[]): Promise<DocumentCompareResult> {
    return request<DocumentCompareResult>("/documents/compare", {
      method: "POST",
      body: { ids },
    });
  },

  deleteDocument(id: number): Promise<DeletedResponse> {
    return request<DeletedResponse>(`/documents/${id}`, {
      method: "DELETE",
    });
  },

  /* ---- Images ---- */
  analyzeImage(file: File, task: ImageTask): Promise<ImageAnalyzeResult> {
    const form = new FormData();
    form.append("file", file);
    form.append("task", task);
    return request<ImageAnalyzeResult>("/images/analyze", {
      method: "POST",
      body: form,
      raw: true,
    });
  },

  /* ---- Voice ---- */
  transcribeVoice(blob: Blob): Promise<VoiceTranscribeResult> {
    const form = new FormData();
    const filename =
      blob instanceof File ? blob.name : "recording.webm";
    form.append("file", blob, filename);
    return request<VoiceTranscribeResult>("/voice/transcribe", {
      method: "POST",
      body: form,
      raw: true,
    });
  },

  voiceCommand(text: string): Promise<VoiceCommandResult> {
    return request<VoiceCommandResult>("/voice/command", {
      method: "POST",
      body: { text },
    });
  },

  /* ---- Knowledge Base ---- */
  knowledgeSearch(
    query: string,
    topK?: number,
  ): Promise<KnowledgeSearchResponse> {
    return request<KnowledgeSearchResponse>("/knowledge/search", {
      method: "POST",
      body: topK !== undefined ? { query, top_k: topK } : { query },
    });
  },

  knowledgeAsk(query: string): Promise<KnowledgeAskResponse> {
    return request<KnowledgeAskResponse>("/knowledge/ask", {
      method: "POST",
      body: { query },
    });
  },

  /* ---- Smart Search ---- */
  search(query: string, types?: string[]): Promise<SearchResponse> {
    return request<SearchResponse>("/search", {
      method: "POST",
      body: types ? { query, types } : { query },
    });
  },

  /* ---- Automation ---- */
  getAutomationTasks(signal?: AbortSignal): Promise<AutomationTask[]> {
    return request<AutomationTask[]>("/automation/tasks", { signal });
  },

  runAutomation(payload: AutomationRunPayload): Promise<AutomationRunResult> {
    return request<AutomationRunResult>("/automation/run", {
      method: "POST",
      body: payload,
    });
  },

  /* ---- Exports ---- */
  createExport(payload: ExportCreatePayload): Promise<ExportItem> {
    return request<ExportItem>("/exports", {
      method: "POST",
      body: payload,
    });
  },

  getExports(signal?: AbortSignal): Promise<ExportItem[]> {
    return request<ExportItem[]>("/exports", { signal });
  },

  /** Build an absolute download URL for an export. */
  exportDownloadUrl(id: number): string {
    return `${API_BASE}${API_PREFIX}/exports/${id}/download`;
  },

  /* ---- Settings ---- */
  getSettings(signal?: AbortSignal): Promise<Settings> {
    return request<Settings>("/settings", { signal });
  },

  updateSettings(payload: SettingsUpdate): Promise<Settings> {
    return request<Settings>("/settings", {
      method: "PUT",
      body: payload,
    });
  },
};

export type Api = typeof api;

// Re-export ModelInfo so consumers importing from api get the type if needed.
export type { ModelInfo };
