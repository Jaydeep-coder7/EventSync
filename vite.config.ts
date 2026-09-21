import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        events: resolve(__dirname, "events.html"),
        eventDetails: resolve(__dirname, "event-details.html"),
        myBookings: resolve(__dirname, "my-bookings.html"),
      },
    },
  },
});
