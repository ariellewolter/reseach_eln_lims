import type { PlatformAPI } from "./types";

declare global { interface Window { __TAURI__?: unknown } }

export const api: PlatformAPI = {
  isTauri: true,
  getVersion() { return "tauri"; },
  openExternal(url) {
    // @ts-ignore lazy import later
    window.open(url, "_blank");
  },
  async notify({ title, body }) {
    // wire to OS notifications later
    console.log("[tauri notify]", title, body);
  }
};
