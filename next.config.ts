import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const { protocol, hostname, port } = new URL(apiUrl);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy client-side API calls through Next.js so cookies stay same-origin
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
    ]
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port,
        pathname: "/**",
      },
      // Allow any HTTPS host — product photos may be served from external CDNs
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
