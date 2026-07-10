"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import ChatInput from "@/components/chat/ChatInput";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import ConnectionDialog from "@/components/settings/ConnectionDialog";
import MemoryDialog from "@/components/settings/MemoryDialog";
import AgentDialog from "@/components/settings/AgentDialog";
import DropZone from "@/components/chat/DropZone";
import WorkspacePane from "@/components/workspace/WorkspacePane";

import { API_URL } from "@/config/api";

import { useConnectionStore } from "@/store/connectionStore";
import {
  useChatStore,
  Message,
} from "@/store/chatStore";

import { useFileUpload } from "@/hooks/useFileUpload";
import { useMemoryStore } from "@/store/memoryStore";
import { useAuthStore } from "@/store/authStore";
import { useAgentStore } from "@/store/agentStore";

export default function Home() {
  const { config } = useConnectionStore();
  const { facts } = useMemoryStore();
  const { activeAgentId, agents } = useAgentStore();

  const {
    chats,
    currentChatId,
    addMessage,
    updateLastAssistantMessage,
    truncateMessages,
  } = useChatStore();

  const { token, logout, username } = useAuthStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.push("/login");
    }
  }, [mounted, token, router]);

  const currentChat = chats.find(
    (c) => c.id === currentChatId
  );

  const {
    files,
    upload,
    remove,
    clear,
  } = useFileUpload();

  const [isStreaming, setIsStreaming] =
    useState(false);

  const [dragging, setDragging] =
    useState(false);

  const [webSearchEnabled, setWebSearchEnabled] =
    useState(false);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  async function handleSend(
    message: string
  ) {
    if (!config || isStreaming) return;

    const images = files.filter(
      (f) => f.isImage
    );

    // Web search augmentation
    let searchContext = "";
    if (webSearchEnabled && message.trim()) {
      try {
        const searchRes = await fetch(
          `${API_URL}/web-search`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ query: message.trim(), max_results: 5 }),
          }
        );
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.results?.length > 0) {
            searchContext = "\n\n[Web Search Results]\n" +
              searchData.results
                .map((r: any, i: number) =>
                  `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}`
                )
                .join("\n\n") +
              "\n\n[End of Search Results]\nUse the above search results to help answer the user's question.\n\n";
          }
        }
      } catch (err) {
        console.error("Web search failed:", err);
      }
    }

    let userContent: any = searchContext + message;

    if (images.length > 0) {
      userContent = [
        {
          type: "text",
          text:
            (searchContext + message).trim() ||
            "Describe this image",
        },

        ...images.map((img) => ({
          type: "image_url",
          image_url: {
            url: `data:${img.mime_type};base64,${img.base64}`,
          },
        })),
      ];
    }

    const userMessage: Message = {
      role: "user",
      content:
        typeof userContent === "string"
          ? message
          : `🖼 ${images.length} image(s) attached\n\n${message}`,
      images: images.map((img) => ({
        filename: img.name,
        mime_type: img.mime_type!,
        base64: img.base64!,
      })),
    };

    addMessage(userMessage);

    const history = (currentChat?.messages ?? []).map((msg) => {
      if (msg.role === "user" && msg.images && msg.images.length > 0) {
        const cleanContent = msg.content.replace(/^🖼 \d+ image\(s\) attached\n\n/, "");
        return {
          role: "user",
          content: [
            {
              type: "text",
              text: cleanContent.trim() || "Describe this image",
            },
            ...msg.images.map((img) => ({
              type: "image_url",
              image_url: {
                url: `data:${img.mime_type};base64,${img.base64}`,
              },
            })),
          ],
        };
      }
      return {
        role: msg.role,
        content: msg.content,
      };
    });

    history.push({
      role: "user",
      content: userContent,
    });

    let memoryContext = "";
    if (facts.length > 0) {
      memoryContext = `\n\nAdditionally, here is some long-term factual memory you should remember about the user across all conversations:\n` +
        facts.map(f => `- ${f}`).join("\n");
    }

    const activeAgent = activeAgentId ? agents.find(a => a.id === activeAgentId) : null;

    const baseSystemPrompt = activeAgent
      ? activeAgent.systemPrompt
      : `You are OmniAI, a helpful AI assistant. 
If the user asks you to generate, create, or draw an image, you MUST reply with a markdown image tag using the Pollinations AI service.
Format: ![User's description of image](https://image.pollinations.ai/prompt/{url_encoded_description}?nologo=true). Do NOT use markdown code blocks for the image tag.

If the user asks you to generate, create, or render a video, you MUST reply with the following exact HTML video tag as a placeholder to demonstrate the UI capability:
<video src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4" controls autoplay className="w-full rounded-lg mt-2" />
Do NOT use markdown code blocks for the video tag either.`;

    const finalMessages = [
      {
        role: "system",
        content: baseSystemPrompt + memoryContext,
      },
      ...history,
    ];

    const controller =
      new AbortController();

    abortControllerRef.current =
      controller;

    setIsStreaming(true);

    try {
      const response = await fetch(
        `${API_URL}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            base_url: config.baseUrl,
            api_key: config.apiKey,
            model: config.model,
            messages: finalMessages,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to contact AI."
        );
      }

      if (!response.body) {
        throw new Error(
          "Streaming not supported."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let assistantText = "";

      addMessage({
        role: "assistant",
        content: "",
      });

      while (true) {
        const {
          done,
          value,
        } = await reader.read();

        if (done) break;

        assistantText += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        updateLastAssistantMessage(
          assistantText
        );
      }
    } catch (error: any) {
      if (
        error.name !== "AbortError"
      ) {
        console.error(error);

        addMessage({
          role: "assistant",
          content:
            "❌ Error contacting AI.",
        });
      }
    } finally {
      abortControllerRef.current =
        null;

      setIsStreaming(false);

      clear();
    }
  }

  function stopGenerating() {
    abortControllerRef.current?.abort();
  }

  async function handleEdit(index: number, newText: string) {
    if (!currentChatId || !currentChat) return;

    // We truncate history to remove the old message at 'index' and everything after
    truncateMessages(currentChatId, index);

    // Then we send the new text
    await handleSend(newText);
  }

  async function handleRegenerate(index: number) {
    if (!currentChatId || !currentChat) return;

    // To regenerate, the assistant message is at 'index'. The user message that triggered it is usually at 'index - 1'.
    // If we're regenerating, we truncate the assistant message (and anything after).
    // And we resend the last user message.

    const messages = currentChat.messages;

    // Find the closest preceding user message
    let lastUserIndex = index - 1;
    while (lastUserIndex >= 0 && messages[lastUserIndex].role !== "user") {
      lastUserIndex--;
    }

    if (lastUserIndex < 0) return; // No user message to base regeneration on

    const lastUserMessage = messages[lastUserIndex];
    let promptContent = "";
    if (typeof lastUserMessage.content === "string") {
      promptContent = lastUserMessage.content.replace(/^🖼 \d+ image\(s\) attached\n\n/, "").trim();
    }

    // Truncate up to lastUserIndex
    truncateMessages(currentChatId, lastUserIndex);

    // Resend it
    await handleSend(promptContent);
  }

  function handleDragOver(
    e: React.DragEvent
  ) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(
    e: React.DragEvent
  ) {
    e.preventDefault();
    setDragging(false);
  }

  async function handleDrop(
    e: React.DragEvent
  ) {
    e.preventDefault();

    setDragging(false);

    if (
      !e.dataTransfer.files.length
    )
      return;

    await upload(
      e.dataTransfer.files
    );
  }

  if (!mounted || !token) return null;

  return (
    <main
      className="relative h-screen flex text-white overflow-hidden bg-[#0a0a0a]"
      style={{
        backgroundImage: "radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(168,85,247,0.08), transparent 25%)"
      }}
      onDragOver={
        handleDragOver
      }
      onDragLeave={
        handleDragLeave
      }
      onDrop={handleDrop}
    >
      <DropZone
        dragging={dragging}
      />

      <ConnectionDialog />
      <MemoryDialog />
      <AgentDialog />

      <ChatSidebar />

      <div className="flex flex-1 min-w-0">
        <div className="flex flex-1 flex-col min-w-0">
          <ChatWindow
            messages={
              currentChat?.messages ??
              []
            }
            onEdit={handleEdit}
            onRegenerate={handleRegenerate}
          />

          <ChatInput
            onSend={handleSend}
            isStreaming={
              isStreaming
            }
            onStop={
              stopGenerating
            }
            files={files}
            upload={upload}
            remove={remove}
            webSearchEnabled={webSearchEnabled}
            onWebSearchToggle={() => setWebSearchEnabled((v) => !v)}
          />
        </div>

        <WorkspacePane />
      </div>

    </main>
  );
}