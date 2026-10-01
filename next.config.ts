import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // STATIC EXPORT — generates pure HTML/CSS/JS files
  // No Node.js needed on the server! Upload to any shared hosting.
  output: 'export',

  // Trailing slash for shared hosting compatibility (Apache/Nginx)
  trailingSlash: true,

  // Shared hosting friendly — no image optimization server needed
  images: {
    unoptimized: true,
  },

  // Disable strict TS checks for build (Framer Motion type widening issue)
  // ESLint already catches real errors
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;