/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // disables ESLint during production builds
  },
};

export default nextConfig;
