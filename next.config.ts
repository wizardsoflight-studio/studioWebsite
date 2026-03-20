import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling native modules — they must run in Node.js,
  // not in the edge/browser bundle. Required for sharp (WebP conversion).
  serverExternalPackages: ['sharp'],

  images: {
    // Serve AVIF then WebP for browsers that support them — best compression
    formats: ['image/avif', 'image/webp'],
    // Allow remote images from Supabase Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
