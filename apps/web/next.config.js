/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker production build
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    workerThreads: false,
    cpus: 1,
    serverComponentsExternalPackages: ['axios']
  },

  images: {
    domains: [
      'localhost',
      'school-erp-uploads.s3.ap-south-1.amazonaws.com',
      process.env.NEXT_PUBLIC_S3_DOMAIN || '',
    ].filter(Boolean),
    formats: ['image/webp', 'image/avif'],
  },

  // Proxy API calls in development (avoids CORS in dev without nginx)
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/:path*`,
        },
      ];
    }
    return [];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

};

module.exports = nextConfig;
