import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Next picks the project root (avoid parent workspace lockfile)
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
