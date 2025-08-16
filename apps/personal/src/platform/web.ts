import type { PlatformAPI } from "./types";

function version() {
  // expose your app version via env if you like
  return (import.meta as any).env?.VITE_APP_VERSION || "web";
}

async function notify({ title, body }: { title: string; body?: string }) {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
      return;
    }
    if (Notification.permission !== "denied") {
      const p = await Notification.requestPermission();
      if (p === "granted") { new Notification(title, { body }); return; }
    }
  }
  alert(`${title}${body ? "\n\n" + body : ""}`);
}

export const api: PlatformAPI = {
  isTauri: false,
  getVersion: version,
  openExternal(url) { window.open(url, "_blank", "noopener,noreferrer"); },
  notify,
};
