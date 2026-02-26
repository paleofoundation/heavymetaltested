/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: [
    '@supabase/supabase-js',
    'mammoth',
  ],
};

export default nextConfig;
