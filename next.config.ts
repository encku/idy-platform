import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.APP_VERSION || "1.0.0",
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
