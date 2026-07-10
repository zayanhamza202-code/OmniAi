 import axios from "axios";

export interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
}

export interface AIModel {
  id: string;
  name: string;
}

function createClient(config: ProviderConfig) {
  return axios.create({
    baseURL: config.baseUrl.replace(/\/$/, ""),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
  });
}

export async function fetchModels(config: ProviderConfig): Promise<AIModel[]> {
  const client = createClient(config);

  const response = await client.get("/models");

  return (response.data.data || []).map((model: any) => ({
    id: model.id,
    name: model.id,
  }));
}