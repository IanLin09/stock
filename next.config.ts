import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your other config options
  reactStrictMode: true,
  // This explicitly tells Next.js where to look
  distDir: '.next',
  pageExtensions: [
        'page.tsx',
        'page.ts',
        'page.jsx',
        'page.js',
        'page.md',
        'page.mdx',
        "page.p.ts",
        "page.p.tsx",
        // FIXME: Next.js has a bug which does not resolve not-found.page.tsx correctly
        // Instead, use `not-found.ts` as a workaround
        // "ts" is required to resolve `not-found.ts`
        // https://github.com/vercel/next.js/issues/65447
        "tsx"
    ],
    // This is the key part 👇
  experimental: {
    typedRoutes: true, // optional
  },
};

export default nextConfig;
