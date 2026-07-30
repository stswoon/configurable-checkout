import { create } from "zustand";

const CONFIG_STORAGE_KEY = "configurable-checkout-config";
const QUOTE_ID_STORAGE_KEY = "configurable-checkout-quote-id";

export type ConfigJson = Record<string, unknown>;

interface ConfigStore {
  config: ConfigJson | null;
  quoteId: string | null;
  applyConfig: (config: ConfigJson, quoteId: string | null) => void;
}

function loadConfigFromStorage(): ConfigJson | null {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as ConfigJson;
  } catch {
    return null;
  }
}

function loadQuoteIdFromStorage(): string | null {
  return localStorage.getItem(QUOTE_ID_STORAGE_KEY);
}

function saveToStorage(config: ConfigJson, quoteId: string | null): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  if (quoteId) {
    localStorage.setItem(QUOTE_ID_STORAGE_KEY, quoteId);
  } else {
    localStorage.removeItem(QUOTE_ID_STORAGE_KEY);
  }
}

export const useConfigStore = create<ConfigStore>((set) => ({
  config: loadConfigFromStorage(),
  quoteId: loadQuoteIdFromStorage(),

  applyConfig: (config, quoteId) => {
    saveToStorage(config, quoteId);
    set({ config, quoteId });
  },
}));
