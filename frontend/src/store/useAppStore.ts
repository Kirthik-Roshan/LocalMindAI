import { create } from "zustand";
import type { RecentAction } from "@/lib/types";

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;

  commandOpen: boolean;
  setCommandOpen: (value: boolean) => void;

  recentActions: RecentAction[];
  pushAction: (action: RecentAction) => void;
  clearActions: () => void;
}

const MAX_RECENT_ACTIONS = 20;

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),

  commandOpen: false,
  setCommandOpen: (value) => set({ commandOpen: value }),

  recentActions: [],
  pushAction: (action) =>
    set((state) => ({
      recentActions: [action, ...state.recentActions].slice(
        0,
        MAX_RECENT_ACTIONS,
      ),
    })),
  clearActions: () => set({ recentActions: [] }),
}));
