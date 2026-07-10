"use client";

import { Bot, Wifi } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 border-b border-gray-800 bg-[#0B1220] flex items-center justify-between px-6">

      <div className="flex items-center gap-3">

        <Bot className="text-blue-500" size={24} />

        <div>
          <h2 className="text-white font-semibold">
            OmniAI
          </h2>

          <p className="text-xs text-gray-400">
            Universal AI Client
          </p>
        </div>

      </div>

      <div className="flex items-center gap-2 rounded-full bg-green-600/20 px-3 py-1">

        <Wifi size={16} className="text-green-500" />

        <span className="text-green-400 text-sm">
          Ready
        </span>

      </div>

    </header>
  );
}