/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: [
    '@anthropic-ai/sdk',
    'openai',
    '@supabase/supabase-js',
    'cheerio',
    'mammoth',
  ],
};

export default nextConfig;
