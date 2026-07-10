"use client";

import { useState } from "react";
import { useMemoryStore } from "@/store/memoryStore";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MemoryDialog() {
    const { isMemoryDialogOpen, setMemoryDialogOpen, facts, addFact, removeFact } =
        useMemoryStore();
    const [newFact, setNewFact] = useState("");

    const handleAddFact = () => {
        if (newFact.trim()) {
            addFact(newFact.trim());
            setNewFact("");
        }
    };

    return (
        <Dialog open={isMemoryDialogOpen} onOpenChange={setMemoryDialogOpen}>
            <DialogContent className="sm:max-w-2xl bg-zinc-950 text-white border border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Long-Term Memory</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-sm text-zinc-400">
                        The AI remembers the following facts about you across all conversations.
                    </p>

                    <div className="max-h-60 overflow-y-auto space-y-2 rounded-lg border border-zinc-800 p-2">
                        {facts.length === 0 ? (
                            <p className="text-zinc-500 text-sm text-center py-4">No memories stored yet.</p>
                        ) : (
                            facts.map((fact, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between bg-zinc-900 px-3 py-2 rounded"
                                >
                                    <span className="text-sm">{fact}</span>
                                    <button
                                        onClick={() => removeFact(idx)}
                                        className="text-red-400 hover:text-red-300 hover:bg-black/20 p-1 rounded transition"
                                        title="Delete Memory"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Input
                            value={newFact}
                            onChange={(e) => setNewFact(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddFact();
                            }}
                            placeholder="E.g. I prefer Python for scripting..."
                            className="flex-1 bg-zinc-900 border-zinc-800 text-white"
                        />
                        <Button onClick={handleAddFact} variant="outline" className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700">
                            Add Fact
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
