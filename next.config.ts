import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Remove standalone output for Vercel deployment
  // output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    // Enable optimization for Vercel deployment
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
