import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'static.mercdn.net',
      },
      {
        protocol: 'https',
        hostname: '**.rakuten.co.jp',
      },
      {
        protocol: 'https',
        hostname: '**.yahoo.co.jp',
      },
    ],
  },
};


export default nextConfig;
