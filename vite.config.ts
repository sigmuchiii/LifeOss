import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tauri expects a fixed dev port.
// host: 127.0.0.1 — важно на Windows: иначе Vite может слушать только IPv6 (::1),
// а Tauri опрашивает IPv4 и бесконечно ждёт dev-сервер.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: { host: "127.0.0.1", port: 1420, strictPort: true },
});
