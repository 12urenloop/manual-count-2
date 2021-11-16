import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import components from "unplugin-vue-components/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Vue plugin
    vue(),

    // Auto import components
    components(),
  ],
  server: {
    port: 8080,
  },
});
