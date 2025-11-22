import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/unlearnai-landing-page/",   // 👈 your repo name
  build: {
    outDir: "docs",                   // 👈 GitHub Pages will serve from docs/
  },
});
