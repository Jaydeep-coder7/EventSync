import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        auth: resolve(__dirname, "auth.html"),
        events: resolve(__dirname, "events.html"),
        eventDetails: resolve(__dirname, "event-details.html"),
        myBookings: resolve(__dirname, "my-bookings.html"),
      },
    },
  },
});
