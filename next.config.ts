import type { NextConfig } from "next";
import { execSync } from "child_process";
import pkg from "./package.json" with { type: "json" };

const [major, minor] = pkg.version.split(".");
let patch = process.env.GIT_COMMIT_COUNT || "0";
try {
  patch = execSync("git rev-list --count HEAD", {
    encoding: "utf-8",
    cwd: process.cwd(),
  }).trim();
} catch {}

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: `${major}.${minor}.${patch}`,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.idycard.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
