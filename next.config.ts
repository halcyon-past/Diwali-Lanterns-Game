import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable WebSocket support for development
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Ensure gif.js worker is served correctly
  async headers() {
    return [
      {
        source: '/gif.worker.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
