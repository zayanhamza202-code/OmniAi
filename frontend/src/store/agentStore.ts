import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface Agent {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
}

interface AgentStore {
    agents: Agent[];
    activeAgentId: string | null;
    isAgentDialogOpen: boolean;

    setAgentDialogOpen: (open: boolean) => void;
    addAgent: (agent: Omit<Agent, "id">) => void;
    removeAgent: (id: string) => void;
    setActiveAgent: (id: string | null) => void;
}

export const useAgentStore = create<AgentStore>()(
    persist(
        (set) => ({
            agents: [],
            activeAgentId: null,
            isAgentDialogOpen: false,

            setAgentDialogOpen: (open) => set({ isAgentDialogOpen: open }),
            addAgent: (agentDetails) =>
                set((state) => ({
                    agents: [...state.agents, { id: uuidv4(), ...agentDetails }],
                })),
            removeAgent: (id) =>
                set((state) => ({
                    agents: state.agents.filter((a) => a.id !== id),
                    activeAgentId: state.activeAgentId === id ? null : state.activeAgentId,
                })),
            setActiveAgent: (id) => set({ activeAgentId: id }),
        }),
        {
            name: "omniai-agent-store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
