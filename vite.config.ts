import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // A QR-ról érkezők gyakran gyenge térerőn vannak: egy fájlban minden,
    // felesleges kérések nélkül.
    assetsInlineLimit: 4096,
  },
});
