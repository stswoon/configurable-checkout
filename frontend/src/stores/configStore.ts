import { create } from "zustand";
import JSON5 from "json5";
import { parseCheckoutConfig, type CheckoutConfig } from "@/modules/checkout/types";

const CONFIG_SOURCE_STORAGE_KEY = "configurable-checkout-config-source";
const LEGACY_CONFIG_STORAGE_KEY = "configurable-checkout-config";
const QUOTE_ID_STORAGE_KEY = "configurable-checkout-quote-id";

interface ConfigStore {
  config: CheckoutConfig | null;
  configSource: string | null;
  quoteId: string | null;
  applyConfig: (config: CheckoutConfig, configSource: string, quoteId: string | null) => void;
}

function parseConfigSource(source: string): CheckoutConfig | null {
  try {
    return parseCheckoutConfig(JSON5.parse(source));
  } catch {
    return null;
  }
}

function loadConfigSourceFromStorage(): string | null {
  const source = localStorage.getItem(CONFIG_SOURCE_STORAGE_KEY);
  if (source) return source;

  const legacy = localStorage.getItem(LEGACY_CONFIG_STORAGE_KEY);
  if (!legacy) return null;

  return parseConfigSource(legacy) ? legacy : null;
}

function loadQuoteIdFromStorage(): string | null {
  return localStorage.getItem(QUOTE_ID_STORAGE_KEY);
}

function saveToStorage(configSource: string, quoteId: string | null): void {
  localStorage.setItem(CONFIG_SOURCE_STORAGE_KEY, configSource);
  localStorage.removeItem(LEGACY_CONFIG_STORAGE_KEY);
  if (quoteId) {
    localStorage.setItem(QUOTE_ID_STORAGE_KEY, quoteId);
  } else {
    localStorage.removeItem(QUOTE_ID_STORAGE_KEY);
  }
}

const initialConfigSource = loadConfigSourceFromStorage();

export const useConfigStore = create<ConfigStore>((set) => ({
  config: initialConfigSource ? parseConfigSource(initialConfigSource) : null,
  configSource: initialConfigSource,
  quoteId: loadQuoteIdFromStorage(),

  applyConfig: (config, configSource, quoteId) => {
    saveToStorage(configSource, quoteId);
    set({ config, configSource, quoteId });
  },
}));
