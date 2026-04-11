/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false, // Ensure source maps are disabled in production
  allowedDevOrigins: ['192.168.1.4'],
  // Silence Turbopack vs Webpack warning in Next.js 16+
  turbopack: {},
  // Ensure that .mjs files for pdfjs-dist workers are handled correctly
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    return config;
  },
};

export default nextConfig;
