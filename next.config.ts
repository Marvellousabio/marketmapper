import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",        // ensures serverless-friendly deployment
  experimental: {
    appDir: true, // runtime is fine
  } as Record<string, unknown>,           // enable App Router if used
};

export default nextConfig;
