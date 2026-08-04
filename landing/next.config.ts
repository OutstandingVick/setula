import type { NextConfig } from "next";

const demoBackendOrigin = (
  process.env.DEMO_BACKEND_ORIGIN ?? "http://127.0.0.1:4000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/pay", destination: `${demoBackendOrigin}/pay` },
      { source: "/pay/app.js", destination: `${demoBackendOrigin}/pay/app.js` },
      { source: "/pay/styles.css", destination: `${demoBackendOrigin}/pay/styles.css` },
      { source: "/pay/favicon.svg", destination: `${demoBackendOrigin}/pay/favicon.svg` },
      { source: "/api/:path*", destination: `${demoBackendOrigin}/api/:path*` },
    ];
  },
};

export default nextConfig;
