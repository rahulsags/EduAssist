/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Completely bypass TypeScript checking during builds for the hackathon
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  // Skip type checking for builds to make deployment faster
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, path: false };
    if (!isServer) {
      // Avoid typecheck on client-side build
      config.plugins = config.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
      );
    }
    return config;
  },
};

module.exports = nextConfig;
