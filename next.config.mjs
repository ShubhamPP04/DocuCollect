/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'qfqyiabucvpfhznalqne.supabase.co',
      `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')}`
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // Only use during development
  },
  eslint: {
    ignoreDuringBuilds: true, // Only use during development
  },
};

export default nextConfig;
