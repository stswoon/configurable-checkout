import { create } from "zustand";

const STORAGE_KEY = "configurable-checkout-config";

export type ConfigJson = Record<string, unknown>;

interface ConfigStore {
  config: ConfigJson | null;
  applyConfig: (config: ConfigJson) => void;
}

function loadFromStorage(): ConfigJson | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

function saveToStorage(config: ConfigJson): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export const useConfigStore = create<ConfigStore>((set) => ({
  config: loadFromStorage(),

  applyConfig: (config) => {
    saveToStorage(config);
    set({ config });
  },
}));
