"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { UploadedFile } from "@/hooks/useFileUpload";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop: () => void;

  files: UploadedFile[];

  upload: (files: FileList | File[]) => Promise<void>;

  remove: (index: number) => void;

  webSearchEnabled: boolean;
  onWebSearchToggle: () => void;
}

export default function ChatInput({
  onSend,
  isStreaming,
  onStop,
  files,
  upload,
  remove,
  webSearchEnabled,
  onWebSearchToggle,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    transcript,
    isListening,
    isSupported: sttSupported,
    start: startListening,
    stop: stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Sync recognized speech into the message input
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  async function chooseFiles(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files) return;

    await upload(e.target.files);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSend() {
    if (isStreaming) return;

    // Stop listening if recording
    if (isListening) {
      stopListening();
    }

    let finalMessage = message.trim();

    files
      .filter((f) => !f.isImage)
      .forEach((file) => {
        finalMessage += `

Attached file (${file.name}):

${file.text}

`;
      });

    if (!finalMessage.trim() && files.length === 0) {
      return;
    }

    onSend(finalMessage);

    setMessage("");
    resetTranscript();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function toggleMic() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  return (
    <div className="border-t border-white/10 bg-black/40 backdrop-blur-2xl p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
      {files.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          {files.map((file, index) => (
            <div key={index} className="relative">
              {file.isImage ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-24 w-24 rounded-lg border border-zinc-700 object-cover"
                />
              ) : (
                <div className="flex h-24 w-44 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-center text-sm">
                  📄 {file.name}
                </div>
              )}

              <button
                onClick={() => remove(index)}
                className="absolute right-1 top-1 rounded-full bg-red-600 px-2 py-1 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          hidden
          multiple
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.md,.markdown,.zip"
          onChange={chooseFiles}
        />

        <Button
          variant="secondary"
          disabled={isStreaming}
          onClick={() => fileInputRef.current?.click()}
        >
          📎
        </Button>

        {sttSupported && (
          <Button
            variant={isListening ? "destructive" : "secondary"}
            disabled={isStreaming}
            onClick={toggleMic}
            className={`relative ${isListening ? "animate-pulse" : ""}`}
            title={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening ? (
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-white animate-ping" />
                🎤
              </span>
            ) : (
              "🎤"
            )}
          </Button>
        )}

        <Button
          variant={webSearchEnabled ? "default" : "secondary"}
          disabled={isStreaming}
          onClick={onWebSearchToggle}
          className={`transition-all ${webSearchEnabled
            ? "bg-blue-600 hover:bg-blue-700 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
            : ""
            }`}
          title={webSearchEnabled ? "Web search ON" : "Web search OFF"}
        >
          🌐
        </Button>

        <Input
          ref={inputRef}
          value={message}
          disabled={isStreaming}
          placeholder={
            isListening
              ? "Listening... speak now"
              : "Type your message..."
          }
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        {isStreaming ? (
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button variant="destructive" onClick={onStop}>
              Stop
            </Button>
          </motion.div>
        ) : (
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button onClick={handleSend}>Send</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}