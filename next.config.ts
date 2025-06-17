import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your other config options
  reactStrictMode: true,
  // This explicitly tells Next.js where to look
  distDir: '.next',
  output:"export",
  pageExtensions: [
        "page.tsx",
        "page.ts",
        // FIXME: Next.js has a bug which does not resolve not-found.page.tsx correctly
        // Instead, use `not-found.ts` as a workaround
        // "ts" is required to resolve `not-found.ts`
        // https://github.com/vercel/next.js/issues/65447
        "ts"
    ],
  
};

export default nextConfig;
