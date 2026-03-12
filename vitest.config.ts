import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.tsx"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/__tests__/integration/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary"],
      include: ["src/components/**", "src/lib/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
