import { defineConfig } from "@tanstack/start/config";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()],
  },
});
