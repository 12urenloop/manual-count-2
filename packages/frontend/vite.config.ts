import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import components from "unplugin-vue-components/vite";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Vue plugin
    vue(),

    // Auto import components
    components()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    }
  },
  server: {
    port: 3001
  }
});
