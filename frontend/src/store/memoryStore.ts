import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface MemoryStore {
    facts: string[];
    isMemoryDialogOpen: boolean;

    addFact: (fact: string) => void;
    removeFact: (index: number) => void;
    setMemoryDialogOpen: (open: boolean) => void;
}

export const useMemoryStore = create<MemoryStore>()(
    persist(
        (set) => ({
            facts: [],
            isMemoryDialogOpen: false,

            addFact: (fact) => set((state) => ({ facts: [...state.facts, fact] })),
            removeFact: (index) => set((state) => ({ facts: state.facts.filter((_, i) => i !== index) })),
            setMemoryDialogOpen: (open) => set({ isMemoryDialogOpen: open }),
        }),
        {
            name: "omniai-memory-store",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ facts: state.facts }), // Only persist facts
        }
    )
);
