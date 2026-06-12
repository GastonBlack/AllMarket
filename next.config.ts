import type { NextConfig } from "next";

const apiOrigin =
  process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_BASE_URL;

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    if (!apiOrigin) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
