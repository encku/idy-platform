import type { NextConfig } from "next";
import { execSync } from "child_process";

function getAppVersion(): string {
  try {
    const count = execSync("git rev-list --count HEAD").toString().trim();
    const hash = execSync("git rev-parse --short HEAD").toString().trim();
    return `1.0.${count}+${hash}`;
  } catch {
    return "1.0.0";
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: getAppVersion(),
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
