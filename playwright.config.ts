import { defineConfig, devices } from "@playwright/test"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, ".env.test") })

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: 1,
  workers: 4,
  reporter: [["list"], ["html", { open: "never" }]],

  projects: [
    // Auth setup — login önce çalışsın
    { name: "setup", testMatch: /auth\.setup\.ts/ },

    // Gerçek testler
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "on-first-retry",
  },

  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
