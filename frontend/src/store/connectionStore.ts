import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConnectionConfig {
  providerName: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

interface ConnectionState {
  isDialogOpen: boolean;
  config: ConnectionConfig | null;
  history: ConnectionConfig[];

  setDialogOpen: (open: boolean) => void;
  connect: (config: ConnectionConfig, saveToHistory?: boolean) => void;
  removeHistory: (index: number) => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      isDialogOpen: true,
      config: null,
      history: [],

      setDialogOpen: (open) =>
        set({
          isDialogOpen: open,
        }),

      connect: (config, saveToHistory = true) => {
        const currentHistory = get().history;
        const exists = currentHistory.some(
          (h) => h.baseUrl === config.baseUrl && h.apiKey === config.apiKey
        );

        let newHistory = currentHistory;
        if (!exists && config.apiKey && saveToHistory) {
          // only save if it's somewhat custom and saveToHistory is true
          newHistory = [...currentHistory, config];
        }

        set({
          config,
          history: newHistory,
          isDialogOpen: false,
        });
      },

      removeHistory: (index: number) => {
        const newHistory = [...get().history];
        newHistory.splice(index, 1);
        set({ history: newHistory });
      }
    }),
    {
      name: "connection-storage", // stores in localStorage
    }
  )
);