"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useMemoryStore } from "@/store/memoryStore";
import { useAgentStore } from "@/store/agentStore";
import { motion } from "framer-motion";

export default function ChatSidebar() {
  const {
    chats,
    currentChatId,
    createChat,
    selectChat,
    deleteChat,
    renameChat,
  } = useChatStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const { setMemoryDialogOpen } = useMemoryStore();
  const { setAgentDialogOpen } = useAgentStore();

  return (
    <aside className="w-72 h-full border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col shadow-2xl z-10">
      <div className="p-4 border-b border-white/5 space-y-3">

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={createChat}
          className="w-full rounded-lg bg-white text-black py-2.5 font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-zinc-200 transition"
        >
          + New Chat
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setMemoryDialogOpen(true)}
          className="w-full rounded-lg bg-black/40 border border-white/10 text-white py-2 text-sm font-medium shadow-md hover:bg-white/10 transition flex items-center justify-center gap-2"
        >
          Brain / Memory
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setAgentDialogOpen(true)}
          className="w-full rounded-lg bg-transparent border border-white/5 text-zinc-400 py-2 text-sm font-medium hover:bg-white/5 hover:text-white transition flex items-center justify-center gap-2"
        >
          AI Personas
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto">

        {chats.map((chat) => (

          <div
            key={chat.id}
            className={`group border-b border-zinc-800 ${currentChatId === chat.id
              ? "bg-zinc-800"
              : "hover:bg-zinc-800/60"
              }`}
          >

            <div className="flex items-center">

              <button
                onClick={() => selectChat(chat.id)}
                onDoubleClick={() => {
                  setEditingId(chat.id);
                  setTitle(chat.title);
                }}
                className="flex-1 text-left px-4 py-3"
              >

                {editingId === chat.id ? (

                  <input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => {
                      renameChat(chat.id, title.trim() || "New Chat");
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        renameChat(chat.id, title.trim() || "New Chat");
                        setEditingId(null);
                      }
                    }}
                    className="w-full rounded bg-zinc-700 px-2 py-1 text-sm outline-none"
                  />

                ) : (

                  <>
                    <div className="font-medium truncate">
                      {chat.title}
                    </div>

                    <div className="text-xs text-zinc-400">
                      {chat.messages.length} messages
                    </div>
                  </>

                )}

              </button>

              <button
                onClick={() => deleteChat(chat.id)}
                className="mr-2 rounded p-2 text-red-400 opacity-0 transition hover:bg-red-500 hover:text-white group-hover:opacity-100"
                title="Delete Chat"
              >
                🗑
              </button>

            </div>

          </div>

        ))}

      </div>

    </aside>
  );
}