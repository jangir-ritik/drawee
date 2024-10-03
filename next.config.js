/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next',
            name: 'static/media/[name].[hash].[ext]',
          },
        },
      ],
    });
    return config;
  },
images: {
    domains: ['localhost', 'drawee-server.onrender.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drawee-server.onrender.com',
        pathname: '/image/**',
      },
    ],
  },
  output: 'standalone'
};

module.exports = nextConfig;