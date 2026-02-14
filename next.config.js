/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enables Strict Mode for better error handling and warnings
  experimental: {
    reactCompiler: true, // Enables React Compiler for optimized rendering (Next 15+)
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upoiuqwwzgjgpnkyhubz.supabase.co', // For Supabase-hosted images (e.g., licenses, ads)
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // For Google Maps/Profiles if integrated
      },
      {
        protocol: 'https',
        hostname: 'maps.gstatic.com', // Google Maps static assets
      },
      {
        protocol: 'https',
        hostname: '**', // Allows any secure remote images (secure fallback for production)
      },
    ],
  },
  // Future Expansion: Add webpack customizations here if needed (e.g., for large libs like OpenAI)
};

module.exports = nextConfig;
