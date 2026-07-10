 import { create } from "zustand";

interface ConnectionConfig {
  providerName: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

interface ConnectionState {
  isDialogOpen: boolean;
  config: ConnectionConfig | null;

  setDialogOpen: (open: boolean) => void;
  connect: (config: ConnectionConfig) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  isDialogOpen: true,
  config: null,

  setDialogOpen: (open) =>
    set({
      isDialogOpen: open,
    }),

  connect: (config) =>
    set({
      config,
      isDialogOpen: false,
    }),
}));