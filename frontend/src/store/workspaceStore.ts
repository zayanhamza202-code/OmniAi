import { create } from "zustand";

interface WorkspaceState {
    isOpen: boolean;
    content: string;
    language: string;

    openWorkspace: (content: string, language: string) => void;
    closeWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    isOpen: false,
    content: "",
    language: "",

    openWorkspace: (content, language) => set({ isOpen: true, content, language }),
    closeWorkspace: () => set({ isOpen: false, content: "", language: "" }),
}));
