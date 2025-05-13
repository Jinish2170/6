/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure refresh and back navigation work properly
  trailingSlash: true,
  // Improve static generation with rewrites
  async rewrites() {
    return [
      {
        source: '/tenant/property/:id',
        destination: '/tenant/property/:id/', // adds trailing slash
      },
      {
        source: '/api/properties/:id',
        destination: '/api/properties/:id/',
      },
      // Normalize any case inconsistencies
      {
        source: '/:path*',
        destination: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-normalized-path',
            value: 'true',
          }
        ]
      }
    ]
  }
}

export default nextConfig
