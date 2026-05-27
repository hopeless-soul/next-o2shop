import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const { protocol, hostname, port } = new URL(apiUrl);

const nextConfig: NextConfig = {
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
