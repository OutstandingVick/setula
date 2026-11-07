import type { NextConfig } from "next";

function backendOrigin(value: string | undefined): string {
  const candidate = value ?? "http://127.0.0.1:4000";
  const parsed = new URL(candidate);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== '/') {
    throw new Error('DEMO_BACKEND_ORIGIN must be an HTTP(S) origin without credentials or a path');
  }
  return parsed.origin;
}

const demoBackendOrigin = backendOrigin(process.env.DEMO_BACKEND_ORIGIN);

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/health", destination: `${demoBackendOrigin}/health` },
      { source: "/pay", destination: `${demoBackendOrigin}/pay` },
      { source: "/pay/app.js", destination: `${demoBackendOrigin}/pay/app.js` },
      { source: "/pay/styles.css", destination: `${demoBackendOrigin}/pay/styles.css` },
      { source: "/pay/favicon.svg", destination: `${demoBackendOrigin}/pay/favicon.svg` },
      { source: "/api/:path*", destination: `${demoBackendOrigin}/api/:path*` },
    ];
  },
};

export default nextConfig;
