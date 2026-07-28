/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.base44.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "uktgbtzlkgxrhrzcvnal.supabase.co" },
    ],
  },
};

module.exports = nextConfig;
