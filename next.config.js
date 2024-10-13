/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });
    return config;
  },
  images: {
    domains: ['drawee-theta.vercel.app/'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drawee-server.onrender.com',
        pathname: '/image/**',
      },
    ],
  },
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
};

module.exports = nextConfig;