import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@huggingface/transformers"],
  env: {
    GROQ_API_KEY: process.env.GROQ_API_KEY, // Force Next.js à charger la variable
  },
};

export default nextConfig;
