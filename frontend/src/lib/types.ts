/**
 * Shared TypeScript interfaces mirroring the backend HTTP contract.
 * These are imported across the entire frontend (spine + pages).
 */

/* ------------------------------------------------------------------ */
/* Health & System                                                     */
/* ------------------------------------------------------------------ */

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface MemoryStats {
  used_gb: number;
  total_gb: number;
  percent: number;
}

export interface DiskStats {
  used_gb: number;
  total_gb: number;
  percent: number;
}

export interface StorageStats {
  documents: number;
  images: number;
  exports: number;
}

export interface OllamaStatus {
  online: boolean;
  model: string;
  version: string;
}

export type HealthState = "healthy" | "degraded" | "offline";

export interface SystemStats {
  cpu_percent: number;
  memory: MemoryStats;
  disk: DiskStats;
  indexed_files: number;
  storage: StorageStats;
  ollama: OllamaStatus;
  health: HealthState;
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export interface DashboardStats {
  documents: number;
  notes: number;
  ai_actions: number;
  indexed_chunks: number;
}

export interface RecentDocument {
  id: number;
  name: string;
  type: string;
  created_at: string;
}

export interface RecentAction {
  id: number;
  action: string;
  module: string;
  summary: string;
  created_at: string;
}

export interface RecentWorkspace {
  id: number;
  title: string;
  updated_at: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  recent_documents: RecentDocument[];
  recent_actions: RecentAction[];
  recent_workspaces: RecentWorkspace[];
}

/* ------------------------------------------------------------------ */
/* Models                                                              */
/* ------------------------------------------------------------------ */

export interface ModelInfo {
  name: string;
  size: number | string;
  modified: string;
}

export interface ModelsResponse {
  models: ModelInfo[];
  current: string;
  online: boolean;
}

export interface ModelPullResponse {
  status: string;
  name: string;
}

/* ------------------------------------------------------------------ */
/* Workspace                                                           */
/* ------------------------------------------------------------------ */

export type TransformAction =
  | "rewrite"
  | "expand"
  | "summarize"
  | "translate"
  | "improve"
  | "report"
  | "action_items"
  | "table"
  | "email"
  | "docs"
  | "minutes";

export interface TransformOptions {
  tone?: string;
  language?: string;
  format?: string;
}

export interface TransformPayload {
  text: string;
  action: TransformAction;
  options?: TransformOptions;
}

export interface TransformResult {
  action: string;
  result: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NoteCreatePayload {
  title: string;
  content: string;
}

export interface NoteUpdatePayload {
  title?: string;
  content?: string;
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export interface DocumentItem {
  id: number;
  name: string;
  type: string;
  size: number;
  pages?: number;
  created_at: string;
  extracted_text?: string;
}

export type DocumentAnalyzeTask =
  | "summary"
  | "key_points"
  | "entities"
  | "timeline"
  | "executive_summary"
  | "qa";

export interface DocumentAnalyzePayload {
  task: DocumentAnalyzeTask;
  question?: string;
}

export interface DocumentAnalyzeResult {
  task: string;
  result: string;
}

export interface DocumentCompareResult {
  result: string;
}

/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */

export type ImageTask =
  | "ocr"
  | "describe"
  | "caption"
  | "explain"
  | "chart"
  | "screenshot";

export interface ImageAnalyzeResult {
  task: string;
  text?: string;
  description?: string;
  caption?: string;
}

/* ------------------------------------------------------------------ */
/* Voice                                                               */
/* ------------------------------------------------------------------ */

export interface VoiceTranscribeResult {
  text: string;
  duration?: number;
}

export interface VoiceCommandResult {
  intent: string;
  response: string;
}

/* ------------------------------------------------------------------ */
/* Knowledge Base                                                      */
/* ------------------------------------------------------------------ */

export interface KnowledgeResult {
  text: string;
  score: number;
  source: string;
  document_id: number;
}

export interface KnowledgeSearchResponse {
  results: KnowledgeResult[];
}

export interface KnowledgeSource {
  source: string;
  document_id: number;
  snippet: string;
}

export interface KnowledgeAskResponse {
  answer: string;
  sources: KnowledgeSource[];
}

/* ------------------------------------------------------------------ */
/* Smart Search                                                        */
/* ------------------------------------------------------------------ */

export interface SearchResult {
  type: string;
  title: string;
  snippet: string;
  score: number;
  id: number;
  module: string;
}

export interface SearchResponse {
  results: SearchResult[];
}

/* ------------------------------------------------------------------ */
/* Automation                                                          */
/* ------------------------------------------------------------------ */

export interface AutomationTask {
  id: string;
  name: string;
  description: string;
}

export interface AutomationRunPayload {
  task: string;
  input?: string;
  options?: Record<string, unknown>;
}

export interface AutomationRunResult {
  task: string;
  result: string;
}

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

export type ExportFormat = "pdf" | "docx" | "md" | "txt" | "json" | "csv";

export interface ExportCreatePayload {
  format: ExportFormat;
  title?: string;
  content: string;
}

export interface ExportItem {
  id: number;
  filename: string;
  format: ExportFormat | string;
  download_url: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export interface Settings {
  model: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
  embedding_model: string;
  ocr_engine: string;
  speech_engine: string;
  theme: string;
  language: string;
}

export type SettingsUpdate = Partial<Settings>;

/* ------------------------------------------------------------------ */
/* Misc helper types                                                   */
/* ------------------------------------------------------------------ */

export interface DeletedResponse {
  deleted: boolean;
}

export interface ApiErrorResponse {
  detail: string;
}
