import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your other config options
  reactStrictMode: true,
  // This explicitly tells Next.js where to look
  distDir: '.next',
  
};

export default nextConfig;
