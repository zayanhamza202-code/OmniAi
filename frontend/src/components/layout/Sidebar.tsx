 "use client";

import { Plus, MessageSquare, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-72 h-screen bg-[#111827] border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">
          OmniAI 🚀
        </h1>

        <p className="text-gray-400 text-sm mt-1">
          Universal AI Client
        </p>
      </div>

      <div className="p-4">
        <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-white hover:bg-blue-700">
          <Plus size={18} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        {["Welcome", "Chat 1", "Chat 2"].map((chat) => (
          <button
            key={chat}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-800"
          >
            <MessageSquare size={18} />
            {chat}
          </button>
        ))}
      </div>

      <div className="border-t border-gray-800 p-4">
        <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-800">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
  );
}