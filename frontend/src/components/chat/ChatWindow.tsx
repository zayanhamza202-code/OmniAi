"use client";

import { useState } from "react";
import { Copy, Check, Volume2, Square, Edit2, RotateCw, Download } from "lucide-react";
import { motion } from "framer-motion";

import MarkdownMessage from "./MarkdownMessage";
import { useTTS } from "@/hooks/useTTS";

interface Message {
  role: "user" | "assistant";
  content: string;
  images?: { filename?: string; mime_type: string; base64: string }[];
}

interface ChatWindowProps {
  messages: Message[];
  onEdit?: (index: number, content: string) => void;
  onRegenerate?: (index: number) => void;
  onPromptSelect?: (prompt: string) => void;
}

export default function ChatWindow({
  messages,
  onEdit,
  onRegenerate,
  onPromptSelect,
}: ChatWindowProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [copiedIndex, setCopiedIndex] =
    useState<number | null>(null);

  const { speak, stop, isSpeaking, speakingId, isSupported: ttsSupported } = useTTS();

  async function copyMessage(
    text: string,
    index: number
  ) {
    await navigator.clipboard.writeText(text);

    setCopiedIndex(index);

    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  }

  function toggleSpeak(text: string, msgId: string) {
    if (isSpeaking && speakingId === msgId) {
      stop();
    } else {
      (speak as any)(text, msgId);
    }
  }

  function downloadChat() {
    let md = `# OmniAI Chat Export\n\n`;
    for (const msg of messages) {
      if (msg.role === "user") {
        md += `## You\n\n${msg.content.replace(/^🖼 \d+ image\(s\) attached\n\n/, "")}\n\n`;
      } else {
        md += `## OmniAI\n\n${msg.content}\n\n`;
      }
    }
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `omniai_chat_${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 relative pt-16">
      {messages.length > 0 && (
        <button
          onClick={downloadChat}
          className="absolute top-4 right-14 flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-black/40 border border-white/10 hover:bg-black/60 rounded-lg transition z-20 backdrop-blur"
          title="Export Conversation as Markdown"
        >
          <Download size={14} /> Export Chat
        </button>
      )}

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[70%] space-y-8 animate-in fade-in duration-700">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.4)] flex items-center justify-center">
              <span className="text-4xl text-white font-black">O</span>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              Welcome to OmniAI
            </h1>
            <p className="text-zinc-400 text-sm max-w-sm text-center">
              Your unlimited, universal AI workspace. Select an engine from Settings or click a prompt below to ignite the spark.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
            {[
              "Draft an email to my boss asking for a raise.",
              "Explain quantum computing to a 5-year-old.",
              "Write a Python script to scrape a website.",
              "Analyze a high-level UI/UX architecture."
            ].map((prompt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPromptSelect && onPromptSelect(prompt)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 p-4 rounded-xl text-left text-sm text-zinc-300 transition-colors shadow-lg"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {messages.map((message, index) => {
        const msgId = `msg-${index}`;
        const isThisSpeaking = isSpeaking && speakingId === msgId;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`group relative max-w-[85%] rounded-2xl p-5 shadow-lg backdrop-blur-md ${message.role === "user"
              ? "ml-auto bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)] border border-indigo-400/30"
              : "bg-white/5 text-zinc-100 border border-white/10"
              }`}
          >
            {message.images && message.images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {message.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={`data:${img.mime_type};base64,${img.base64}`}
                    alt={img.filename || "Uploaded file"}
                    className="max-h-60 max-w-full rounded-lg border border-zinc-700 object-contain shadow-md"
                  />
                ))}
              </div>
            )}

            {message.role === "user" && editingIndex === index ? (
              <div className="flex flex-col gap-2 mt-2">
                <textarea
                  className="bg-black/20 text-white rounded p-2 min-w-[250px] w-full min-h-[100px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="px-3 py-1 bg-black/20 hover:bg-black/40 rounded transition text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (onEdit) onEdit(index, editContent);
                      setEditingIndex(null);
                    }}
                    className="px-3 py-1 bg-white text-blue-600 hover:bg-blue-50 rounded transition font-medium text-xs shadow"
                  >
                    Save & Submit
                  </button>
                </div>
              </div>
            ) : (
              <MarkdownMessage
                content={message.content}
              />
            )}

            {!isThisSpeaking && (
              <div className="absolute right-2 bottom-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {ttsSupported && message.role === "assistant" && message.content && (
                  <button
                    onClick={() => toggleSpeak(message.content, msgId)}
                    className={`rounded p-1 transition-colors ${isThisSpeaking
                      ? "bg-blue-500/30 text-blue-400"
                      : "hover:bg-white/10"
                      }`}
                    title={isThisSpeaking ? "Stop reading" : "Read aloud"}
                  >
                    {isThisSpeaking ? (
                      <Square size={14} />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </button>
                )}

                <button
                  onClick={() =>
                    copyMessage(
                      message.content,
                      index
                    )
                  }
                  className="rounded p-1 hover:bg-white/10"
                >
                  {copiedIndex === index ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>

                {message.role === "assistant" && onRegenerate && (
                  <button
                    onClick={() => onRegenerate(index)}
                    className="rounded p-1 hover:bg-white/10"
                    title="Regenerate response"
                  >
                    <RotateCw size={16} />
                  </button>
                )}

                {message.role === "user" && onEdit && editingIndex !== index && (
                  <button
                    onClick={() => {
                      setEditingIndex(index);
                      // Extract text if there is an image attachment header
                      setEditContent(message.content.replace(/^🖼 \d+ image\(s\) attached\n\n/, ""));
                    }}
                    className="rounded p-1 hover:bg-white/10"
                    title="Edit message"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
            )}

          </motion.div>
        );
      })}

    </div>
  );
}