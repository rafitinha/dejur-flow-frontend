/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {},
  turbopack: {
    root: process.cwd(),
  },
};
export default nextConfig;
