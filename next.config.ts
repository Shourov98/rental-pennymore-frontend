import type { NextConfig } from "next";

const API_PROXY_TARGET =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v\d+\/?$/, "") ||
  "http://localhost:7070";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/pre-market-listing",
        destination: "/Request-Submlsslon-Page",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Proxy API calls through the same origin so the browser doesn't need
    // CORS headers when the upstream API is hosted on a different host
    // (e.g. a Microsoft Dev Tunnel URL pointing to a local dev server).
    // Production builds should use a real public API URL and disable this.
    if (process.env.NEXT_PUBLIC_API_BASE_URL?.includes("devtunnels.ms")) {
      return [
        {
          source: "/api/proxy/:path*",
          destination: `${API_PROXY_TARGET}/api/v1/:path*`,
        },
      ];
    }
    return [];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
          },
        ],
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        // Polling drastically reduces file descriptor usage on low-limit filesystems.
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/.git/**", "**/.next/**", "**/node_modules/**"],
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "www.instagram.com",
      },
      {
        protocol: "https",
        hostname: "www.tiktok.com",
      },
      {
        protocol: "https",
        hostname: "hel1.your-objectstorage.com",
      },
    ],
  },
};

export default nextConfig;
