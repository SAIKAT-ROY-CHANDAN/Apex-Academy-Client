import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["quill"],
  images: {
    // The API serves uploaded images from the local backend during development.
    // Next.js 16 blocks private-IP image optimization unless this is explicitly enabled.
    dangerouslyAllowLocalIP: true,
    qualities: [70, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "::1",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "react-icons",
    ],
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
