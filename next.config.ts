import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-responsive-carousel"],
  eslint: {
    // ESLint bazı Node/ESM modül kombinasyonlarında runtime hatası üretebiliyor.
    // Build sırasında kırmasın diye devre dışı bırakıyoruz.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qxrbqckbuviqgekopmiu.supabase.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    minimumCacheTTL: 864000,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/cars",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
