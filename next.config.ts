import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"], // On ne garde que pdf-parse
};

export default nextConfig;
