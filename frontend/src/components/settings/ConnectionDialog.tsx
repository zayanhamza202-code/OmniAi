"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { useConnectionStore } from "@/store/connectionStore";
import { useAuthStore } from "@/store/authStore";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AIModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  free: boolean;
}

export default function ConnectionDialog() {
  const {
    isDialogOpen,
    setDialogOpen,
    connect,
    history,
    removeHistory,
  } = useConnectionStore();
  const { token } = useAuthStore();

  const [providerName, setProviderName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  const [model, setModel] = useState("");

  const [models, setModels] = useState<AIModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredModels = useMemo(() => {
    return models.filter((m) =>
      (
        m.name +
        " " +
        m.id +
        " " +
        m.description
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [models, search]);

  async function handleFetchModels() {
    if (!baseUrl || !apiKey) {
      toast.error("Base URL and API Key are required.");
      return;
    }

    try {
      setLoadingModels(true);

      const response = await api.post("/connect", {
        provider_name: providerName,
        base_url: baseUrl,
        api_key: apiKey,
        model,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setModels(response.data.models);

      toast.success(
        `${response.data.models.length} models fetched.`
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch models.");
    } finally {
      setLoadingModels(false);
    }
  }

  function handleConnect() {
    if (!baseUrl || !apiKey) {
      toast.error("Base URL and API Key are required.");
      return;
    }

    if (!model) {
      toast.error("Please select a model.");
      return;
    }

    connect({
      providerName,
      baseUrl,
      apiKey,
      model,
    });

    toast.success("Provider connected.");
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={setDialogOpen}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Connect AI Provider
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div>
            <h3 className="text-sm font-semibold mb-2">Quick Select Provider:</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700" onClick={() => { setProviderName("OmniFree (Free)"); setBaseUrl("https://api.iamhc.cn/v1"); setApiKey("sk-QbI7SppbSQbB3iCCUqjK3HEwhvwrD891zFtWYggB5K6ERXQG"); }}>
                ★ Set Free API
              </Button>
              <Button size="sm" variant="default" className="bg-slate-900 border border-slate-700 text-white hover:bg-slate-800" onClick={() => { setProviderName("GitHub Models (Free)"); setBaseUrl("https://models.inference.ai.azure.com"); setApiKey(""); }}>
                <svg className="w-4 h-4 mr-2 inline" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                GitHub Models Server
              </Button>
              <Button size="sm" variant="default" className="bg-emerald-600/80 border border-emerald-500/50 text-white hover:bg-emerald-500" onClick={() => { setProviderName("Pollinations (Free)"); setBaseUrl("https://text.pollinations.ai/openai"); setApiKey("dummy-key"); }}>
                ✨ Pollinations (Unlimited)
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setProviderName("OpenRouter"); setBaseUrl("https://openrouter.ai/api/v1"); }}>
                OpenRouter
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setProviderName("Groq"); setBaseUrl("https://api.groq.com/openai/v1"); }}>
                Groq
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setProviderName("Together AI"); setBaseUrl("https://api.together.xyz/v1"); }}>
                Together AI
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setProviderName("LM Studio"); setBaseUrl("http://localhost:1234/v1"); }}>
                LM Studio
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setProviderName("DeepSeek"); setBaseUrl("https://api.deepseek.com/v1"); }}>
                DeepSeek
              </Button>
              {/* Hide the lesser known ones into a text list or smaller grid if needed, but they remain intact for now */}
            </div>

            {history && history.length > 0 && (
              <div className="pt-2 border-t border-white/5 mt-2">
                <h3 className="text-sm font-semibold mb-2 text-blue-400">Your Saved Engines:</h3>
                <div className="flex gap-2 flex-col max-h-40 overflow-y-auto pr-2">
                  {history.map((h, i) => (
                    <div key={i} className="flex gap-2 items-center bg-zinc-800/50 p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition">
                      <button
                        className="flex-1 text-left text-sm"
                        onClick={() => {
                          setProviderName(h.providerName || "Custom");
                          setBaseUrl(h.baseUrl);
                          setApiKey(h.apiKey);
                          if (h.model) setModel(h.model);
                          setShowAdvanced(true);
                        }}
                      >
                        <div className="text-white font-medium">{h.providerName || "Custom Provider"}</div>
                        <div className="text-zinc-500 text-xs truncate max-w-[200px]">{h.baseUrl}</div>
                      </button>
                      <button onClick={() => removeHistory(i)} className="text-red-400 hover:text-red-300 p-2">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 pb-2 border-t border-white/5 mt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-zinc-400 hover:text-white transition flex items-center justify-between w-full"
              >
                Advanced Setup (Custom APIs)
                <span>{showAdvanced ? "▲" : "▼"}</span>
              </button>
            </div>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <Input
                    placeholder="Provider Name (Optional)"
                    value={providerName}
                    onChange={(e) =>
                      setProviderName(e.target.value)
                    }
                  />

                  <Input
                    placeholder="Base URL"
                    value={baseUrl}
                    onChange={(e) =>
                      setBaseUrl(e.target.value)
                    }
                  />

                  <Input
                    type="password"
                    placeholder="API Key"
                    value={apiKey}
                    onChange={(e) =>
                      setApiKey(e.target.value)
                    }
                  />

                  <Input
                    placeholder="Model ID (e.g., gpt-4o or gemini-pro)"
                    value={model}
                    onChange={(e) =>
                      setModel(e.target.value)
                    }
                  />

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-zinc-800 text-white rounded-lg py-2 hover:bg-zinc-700 transition"
                    onClick={handleFetchModels}
                  >
                    {loadingModels
                      ? "Fetching Models..."
                      : "Force Fetch Remote Models (Optional)"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {models.length > 0 && (
            <>
              <Input
                placeholder="Search model..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <div className="h-72 overflow-y-auto rounded-lg border border-white/10">

                {filteredModels.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setModel(m.id)
                    }
                    className={`w-full border-b border-white/10 p-3 text-left transition hover:bg-zinc-800 ${model === m.id
                      ? "bg-zinc-800"
                      : "bg-black/20"
                      }`}
                  >
                    <div className="flex items-center justify-between">

                      <div className="font-medium text-white">
                        {m.name}
                      </div>

                      {m.free && (
                        <span className="rounded bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-xs">
                          FREE
                        </span>
                      )}

                    </div>

                    <div className="mt-1 text-xs text-zinc-400">
                      {m.id}
                    </div>

                    <div className="mt-1 text-xs text-zinc-500">
                      Context:{" "}
                      {m.context_length.toLocaleString()}
                    </div>

                  </button>
                ))}

              </div>
            </>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full bg-white text-black font-bold py-3 mt-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-zinc-200 transition"
            onClick={handleConnect}
          >
            Activate Engine
          </motion.button>

        </div>
      </DialogContent>
    </Dialog>
  );
}