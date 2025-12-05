import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    minimumCacheTTL: 3600,
  }
};

export default nextConfig;
