import localforage from "localforage";
import type { StateStorage } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";

localforage.config({ name: "research-notebook", storeName: "app" });

export const idbStorage: StateStorage = {
  getItem: async (name) => (await localforage.getItem<string>(name)) ?? null,
  setItem: async (name, value) => { await localforage.setItem(name, value); },
  removeItem: async (name) => { await localforage.removeItem(name); },
};

export const idbJSON = () => createJSONStorage(() => idbStorage);
