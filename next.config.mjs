/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['qfqyiabucvpfhznalqne.supabase.co'], // Add your Supabase project domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qfqyiabucvpfhznalqne.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
