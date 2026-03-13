import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // page-agent and its workspace packages are pure ESM — transpile them for Next.js
  transpilePackages: [
    "page-agent",
    "@page-agent/core",
    "@page-agent/llms",
    "@page-agent/page-controller",
    "@page-agent/ui",
  ],
};

export default nextConfig;
