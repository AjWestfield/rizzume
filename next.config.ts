import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize packages that don't work with bundlers
  serverExternalPackages: ['@browserbasehq/stagehand', 'pino', 'thread-stream'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
    ],
  },
};

export default nextConfig;
