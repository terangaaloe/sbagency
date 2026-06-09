import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray lockfile lives in the
  // user home directory, which otherwise confuses Turbopack's root inference).
  turbopack: {
    root: __dirname,
  },
  // Sous-domaines de dev autorisés pour le routing multi-tenant local.
  // Convention : {slug}.lvh.me (tenants) + app.lvh.me (back-office), tous
  // couverts par `*.lvh.me`. lvh.me et *.lvh.me résolvent vers 127.0.0.1.
  allowedDevOrigins: ["lvh.me", "*.lvh.me"],
  images: {
    // Property photos are served from the Structure B (Wix) image CDN.
    remotePatterns: [{ protocol: "https", hostname: "static.wixstatic.com" }],
  },
};

export default nextConfig;
