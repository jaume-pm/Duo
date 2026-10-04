import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Duo/" : "/",
  server: {
    host: true,
    port: 4721,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4721,
    strictPort: true,
  },
}));
