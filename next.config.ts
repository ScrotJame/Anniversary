import type { NextConfig } from "next";

// GitHub Pages serves the site under /<repo-name>. Locally (`npm run dev`) we keep the root path.
const basePath = process.env.NODE_ENV === "production" ? "/Anniversary" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
