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
      }
    ]
  }
}

export default nextConfig
