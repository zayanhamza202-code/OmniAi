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
  onEdit?: (index: number, newContent: string) => void;
  onRegenerate?: (index: number) => void;
}

export default function ChatWindow({
  messages,
  onEdit,
  onRegenerate,
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
    <div className="flex-1 overflow-y-auto p-6 space-y-4 relative pt-12">
      {messages.length > 0 && (
        <button
          onClick={downloadChat}
          className="absolute top-4 right-6 flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
          title="Export Conversation as Markdown"
        >
          <Download size={14} /> Export Chat
        </button>
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