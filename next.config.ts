import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* League crests are served by Front9 alongside its public API. */
    remotePatterns: [new URL("https://api.front9.com/media/**")],
  },
};

export default nextConfig;
