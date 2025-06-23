import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking attacks
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  // Enable XSS protection in browsers
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  // Only allow HTTPS connections
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  // Control which features and APIs can be used
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  // Content Security Policy - customize based on your needs
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Adjust for your needs
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API || 'https://localhost:3000'}`,
      "frame-ancestors 'none'"
    ].join('; ')
  }
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
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
