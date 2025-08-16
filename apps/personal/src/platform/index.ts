import { api as web } from "./web";
let platform = web;

if ("__TAURI__" in window) {
  // dynamic import later if needed; web default is fine for now
  // const mod = await import("./tauri"); platform = mod.api;
}

export { platform };
