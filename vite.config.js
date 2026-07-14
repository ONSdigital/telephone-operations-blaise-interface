import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    appType: "spa",
    plugins: [react()],
    define: {
      "import.meta.env.VITE_PROJECT_ID": JSON.stringify(
        env.VITE_PROJECT_ID ?? env.PROJECT_ID ?? "",
      ),
      "import.meta.env.VITE_URL_DOMAIN": JSON.stringify(
        env.VITE_URL_DOMAIN ?? env.URL_DOMAIN ?? "",
      ),
      "import.meta.env.VITE_VM_EXTERNAL_CLIENT_URL": JSON.stringify(
        env.VITE_VM_EXTERNAL_CLIENT_URL ?? env.VM_EXTERNAL_CLIENT_URL ?? "",
      ),
      "import.meta.env.VITE_APP_CATI_DASHBOARD_URL": JSON.stringify(
        env.VITE_APP_CATI_DASHBOARD_URL ?? env.CATI_DASHBOARD_URL ?? "",
      ),
    },
    build: {
      outDir: "build/client",
      sourcemap: true,
    },
    server: {
      port: 3000,
      proxy: {
        "/api": { target: "http://localhost:5000", changeOrigin: true },
        "/upload": { target: "http://localhost:5000", changeOrigin: true },
        "/bucket": { target: "http://localhost:5000", changeOrigin: true },
      },
    },
  };
});
