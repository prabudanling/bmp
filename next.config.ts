import type { NextConfig } from "next";

/**
 * BUILD_EXPORT=1 → mode static export untuk shared hosting:
 * hasil HTML statis di folder out/ (dipakai scripts/build-deploy.mjs).
 * distDir dipisah ke .next-export agar dev server (.next) tidak terganggu.
 */
const isExport = process.env.BUILD_EXPORT === "1";

const nextConfig: NextConfig = isExport
  ? {
      output: "export",
      distDir: ".next-export",
      images: { unoptimized: true },
      typescript: { ignoreBuildErrors: true },
      reactStrictMode: false,
    }
  : {
      output: "standalone",
      typescript: { ignoreBuildErrors: true },
      reactStrictMode: false,
    };

export default nextConfig;
