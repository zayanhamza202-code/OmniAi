"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function WorkspacePane() {
    const { isOpen, content, language, closeWorkspace } = useWorkspaceStore();
    const [activeTab, setActiveTab] = useState<"code" | "preview">(
        language === "html" ? "preview" : "code"
    );

    if (!isOpen) return null;

    return (
        <div className="w-[50%] min-w-[300px] border-l border-zinc-800 bg-[#0f0f11] flex flex-col h-full z-10 transition-all duration-300">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab("code")}
                        className={`px-3 py-1 text-sm rounded transition ${activeTab === "code"
                                ? "bg-zinc-700 text-white"
                                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                            }`}
                    >
                        Code
                    </button>
                    {language === "html" && (
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={`px-3 py-1 text-sm rounded transition ${activeTab === "preview"
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                                }`}
                        >
                            Preview
                        </button>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-xs font-mono text-zinc-500 uppercase">
                        {language}
                    </span>
                    <button
                        onClick={closeWorkspace}
                        className="text-zinc-400 hover:text-white transition"
                        title="Close Workspace"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto relative">
                {activeTab === "code" ? (
                    <pre className="p-4 m-0 text-sm font-mono text-zinc-300">
                        <code>{content}</code>
                    </pre>
                ) : (
                    <iframe
                        srcDoc={content}
                        className="w-full h-full border-none bg-white"
                        title="Preview"
                        sandbox="allow-scripts allow-modals allow-popups"
                    />
                )}
            </div>
        </div>
    );
}
