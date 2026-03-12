import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    include: ["src/__tests__/integration/**/*.integration.test.ts"],
    testTimeout: 15_000,
    hookTimeout: 30_000,
    setupFiles: ["./src/__tests__/integration/setup-integration.ts"],
    globals: true,
    env: {
      BASE_URL: "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
