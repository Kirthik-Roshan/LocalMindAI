import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings } from "@/lib/types";

interface SettingsState extends Settings {
  set: (partial: Partial<Settings>) => void;
  reset: () => void;
}

export const DEFAULT_SETTINGS: Settings = {
  model: "qwen2.5:3b",
  temperature: 0.7,
  top_p: 0.9,
  max_tokens: 2048,
  embedding_model: "all-minilm",
  ocr_engine: "tesseract",
  speech_engine: "whisper",
  theme: "dark",
  language: "en",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      set: (partial) => set(partial),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: "localmind-settings",
      version: 1,
      partialize: (state) => ({
        model: state.model,
        temperature: state.temperature,
        top_p: state.top_p,
        max_tokens: state.max_tokens,
        embedding_model: state.embedding_model,
        ocr_engine: state.ocr_engine,
        speech_engine: state.speech_engine,
        theme: state.theme,
        language: state.language,
      }),
    },
  ),
);
