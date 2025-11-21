import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import fs from "fs";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "icons/*.png"],
      manifest: {
        name: "Marzjo",
        short_name: "Marzjo",
        description: "running and walking tracker app",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0b74de",
        icons: [
          { src: "/icons/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/pwa-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.maptiler\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "map-tiles", expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 4173,
    https: getHttpsConfig(),
  },
  preview: {
    host: true,
    port: 4173,
    https: getHttpsConfig(),
  },
});

function getHttpsConfig() {
  try {
    const keyPath = path.resolve(__dirname, ".cert/key.pem");
    const certPath = path.resolve(__dirname, ".cert/cert.pem");

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      console.log("✓ Using HTTPS");
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }

    console.warn("⚠ No certificates found. Run: npm run generate-cert");
    return undefined;
  } catch (error) {
    console.error("Error loading certificates:", error);
    return undefined;
  }
}
