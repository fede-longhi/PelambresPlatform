import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental',
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/admin/quotes',
        destination: '/admin/quote-requests',
        permanent: true,
      },
      {
        source: '/admin/quotes/:path*',
        destination: '/admin/quote-requests/:path*',
        permanent: true,
      },
      {
        source: '/admin/prints',
        destination: '/admin/print-jobs',
        permanent: true,
      },
      {
        source: '/admin/prints/:path*',
        destination: '/admin/print-jobs/:path*',
        permanent: true,
      },
      {
        source: '/store/productos',
        destination: '/store/products',
        permanent: true,
      },
      {
        source: '/store/productos/:path*',
        destination: '/store/products/:path*',
        permanent: true,
      },
      {
        source: '/store/disenos',
        destination: '/store/designs',
        permanent: true,
      },
      {
        source: '/store/disenos/:path*',
        destination: '/store/designs/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'my-blob-store.public.blob.vercel-storage.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
      }
    ],
  },
};

export default nextConfig;
