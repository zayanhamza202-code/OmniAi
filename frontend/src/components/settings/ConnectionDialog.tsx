"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
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
  } = useConnectionStore();
  const { token } = useAuthStore();

  const [providerName, setProviderName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  const [model, setModel] = useState("");

  const [models, setModels] = useState<AIModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const [search, setSearch] = useState("");

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
            </div>

            <Input
              placeholder="Provider Name (Optional)"
              value={providerName}
              onChange={(e) =>
                setProviderName(e.target.value)
              }
            />
          </div>

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

          <Button
            variant="outline"
            disabled={loadingModels}
            onClick={handleFetchModels}
          >
            {loadingModels
              ? "Fetching..."
              : "Fetch Models"}
          </Button>

          {models.length > 0 && (
            <>
              <Input
                placeholder="Search model..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <div className="h-72 overflow-y-auto rounded-lg border">

                {filteredModels.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setModel(m.id)
                    }
                    className={`w-full border-b p-3 text-left hover:bg-zinc-800 ${model === m.id
                      ? "bg-zinc-800"
                      : ""
                      }`}
                  >
                    <div className="flex items-center justify-between">

                      <div className="font-medium">
                        {m.name}
                      </div>

                      {m.free && (
                        <span className="rounded bg-green-600 px-2 py-1 text-xs">
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

          <Button
            className="w-full"
            onClick={handleConnect}
          >
            Connect
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}