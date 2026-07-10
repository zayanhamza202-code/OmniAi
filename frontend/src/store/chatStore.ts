import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Message {
  role: "user" | "assistant";
  content: string;

  image?: string;
  images?: { filename?: string; mime_type: string; base64: string }[];
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

interface ChatStore {
  chats: Chat[];
  currentChatId: string;

  createChat: () => void;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;

  addMessage: (message: Message) => void;

  updateLastAssistantMessage: (
    content: string
  ) => void;
  truncateMessages: (
    chatId: string,
    index: number
  ) => void;
}

const createNewChat = (): Chat => ({
  id: crypto.randomUUID(),
  title: "New Chat",
  messages: [],
});

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => {
      const firstChat = createNewChat();

      return {
        chats: [firstChat],
        currentChatId: firstChat.id,

        createChat: () =>
          set((state) => {
            const newChat = createNewChat();

            return {
              chats: [...state.chats, newChat],
              currentChatId: newChat.id,
            };
          }),

        selectChat: (id) =>
          set({
            currentChatId: id,
          }),

        deleteChat: (id) =>
          set((state) => {
            const chats = state.chats.filter(
              (c) => c.id !== id
            );

            if (!chats.length) {
              const chat = createNewChat();

              return {
                chats: [chat],
                currentChatId: chat.id,
              };
            }

            return {
              chats,
              currentChatId: chats[0].id,
            };
          }),

        renameChat: (id, title) =>
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === id
                ? {
                  ...chat,
                  title,
                }
                : chat
            ),
          })),

        addMessage: (message) =>
          set((state) => ({
            chats: state.chats.map((chat) => {
              if (
                chat.id !== state.currentChatId
              ) {
                return chat;
              }

              const messages = [
                ...chat.messages,
                message,
              ];

              let title = chat.title;

              if (
                title === "New Chat" &&
                message.role === "user"
              ) {
                const firstLine =
                  message.content ||
                  "Image Chat";

                title =
                  firstLine.length > 30
                    ? firstLine.slice(0, 30) + "..."
                    : firstLine;
              }

              return {
                ...chat,
                title,
                messages,
              };
            }),
          })),

        updateLastAssistantMessage: (
          content
        ) =>
          set((state) => ({
            chats: state.chats.map((chat) => {
              if (
                chat.id !== state.currentChatId
              ) {
                return chat;
              }

              const messages = [
                ...chat.messages,
              ];

              if (
                messages.length &&
                messages[
                  messages.length - 1
                ].role === "assistant"
              ) {
                messages[
                  messages.length - 1
                ] = {
                  ...messages[
                  messages.length - 1
                  ],
                  content,
                };
              }

              return {
                ...chat,
                messages,
              };
            }),
          })),

        truncateMessages: (chatId, index) =>
          set((state) => ({
            chats: state.chats.map((chat) => {
              if (chat.id !== chatId) return chat;
              return {
                ...chat,
                messages: chat.messages.slice(0, index),
              };
            }),
          })),
      };
    },
    {
      name: "omniai-chat-store",
      storage: createJSONStorage(
        () => localStorage
      ),
    }
  )
);