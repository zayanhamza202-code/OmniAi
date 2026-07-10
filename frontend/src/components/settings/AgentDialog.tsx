"use client";

import { useState } from "react";
import { useAgentStore } from "@/store/agentStore";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AgentDialog() {
    const {
        agents,
        activeAgentId,
        isAgentDialogOpen,
        setAgentDialogOpen,
        addAgent,
        removeAgent,
        setActiveAgent,
    } = useAgentStore();

    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newPrompt, setNewPrompt] = useState("");

    const handleCreate = () => {
        if (newName.trim() && newPrompt.trim()) {
            addAgent({
                name: newName.trim(),
                description: newDesc.trim(),
                systemPrompt: newPrompt.trim(),
            });
            setNewName("");
            setNewDesc("");
            setNewPrompt("");
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={isAgentDialogOpen} onOpenChange={setAgentDialogOpen}>
            <DialogContent className="sm:max-w-2xl bg-zinc-950 text-white border border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Custom Agents</DialogTitle>
                </DialogHeader>

                {!isCreating && (
                    <div className="space-y-4">
                        <p className="text-sm text-zinc-400">
                            Select an active AI persona for your chats.
                        </p>

                        <div className="max-h-60 overflow-y-auto space-y-2 rounded-lg border border-zinc-800 p-2">
                            <div
                                onClick={() => setActiveAgent(null)}
                                className={`flex items-center justify-between cursor-pointer px-3 py-2 rounded border ${activeAgentId === null
                                        ? "bg-blue-500/10 border-blue-500/50"
                                        : "bg-zinc-900 border-transparent hover:bg-zinc-800"
                                    }`}
                            >
                                <div>
                                    <h4 className="text-sm font-semibold text-white">OmniAI Default</h4>
                                    <p className="text-xs text-zinc-500">Standard helpful assistant</p>
                                </div>
                            </div>

                            {agents.map((agent) => (
                                <div
                                    key={agent.id}
                                    onClick={() => setActiveAgent(agent.id)}
                                    className={`flex items-center justify-between cursor-pointer px-3 py-2 rounded border group ${activeAgentId === agent.id
                                            ? "bg-blue-500/10 border-blue-500/50"
                                            : "bg-zinc-900 border-transparent hover:bg-zinc-800"
                                        }`}
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h4 className="text-sm font-semibold text-white truncate">{agent.name}</h4>
                                        <p className="text-xs text-zinc-500 truncate">{agent.description || "No description"}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeAgent(agent.id);
                                        }}
                                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 p-1 transition"
                                        title="Delete Agent"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={() => setIsCreating(true)}
                            className="w-full border border-dashed border-zinc-700 bg-transparent hover:bg-zinc-900 text-zinc-300"
                        >
                            + Create New Agent
                        </Button>
                    </div>
                )}

                {isCreating && (
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Role / Name</label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Senior Python dev"
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Description</label>
                            <Input
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="e.g. Writes PEP-8 compliant code"
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-zinc-400 mb-1 block">System Prompt</label>
                            <textarea
                                value={newPrompt}
                                onChange={(e) => setNewPrompt(e.target.value)}
                                placeholder="You are an expert Python engineer. You only respond with raw code blocks..."
                                className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-white resize-none"
                            />
                        </div>

                        <div className="flex space-x-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreating(false)}
                                className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                                disabled={!newName.trim() || !newPrompt.trim()}
                            >
                                Save Persona
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
