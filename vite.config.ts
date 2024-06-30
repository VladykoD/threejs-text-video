import {defineConfig} from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3010,
    hmr: {
      port: 3010,
      host: "localhost",
    },
  },
});
