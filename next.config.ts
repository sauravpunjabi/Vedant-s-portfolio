import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Covers are resized in the browser before upload; this is the ceiling (Vercel caps bodies at 4.5MB).
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
