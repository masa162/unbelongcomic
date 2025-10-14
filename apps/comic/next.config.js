/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.unbelong.xyz', 'imagedelivery.net'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
  },
}

module.exports = nextConfig
