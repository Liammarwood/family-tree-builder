import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  allowedDevOrigins: ["*"],
  images: { unoptimized: true },
};

export default nextConfig;
