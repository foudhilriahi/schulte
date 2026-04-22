import createPWA from '@ducanh2912/next-pwa'

const customRuntimeCaching = [
  {
    urlPattern: ({ sameOrigin, url }) =>
      sameOrigin &&
      (url.pathname === '/manifest.json' ||
        url.pathname.startsWith('/icon-') ||
        url.pathname.startsWith('/apple-touch-icon') ||
        url.pathname.startsWith('/favicon')),
    handler: 'CacheFirst',
    options: {
      cacheName: 'app-shell-assets',
      expiration: {
        maxEntries: 16,
        maxAgeSeconds: 31536000,
      },
    },
  },
  {
    urlPattern: ({ sameOrigin, request, url }) =>
      sameOrigin && request.method === 'GET' && url.pathname.startsWith('/api/uploads/'),
    handler: 'CacheFirst',
    options: {
      cacheName: 'candidate-upload-assets',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 604800,
      },
    },
  },
  {
    urlPattern: ({ sameOrigin, request, url }) =>
      sameOrigin &&
      request.method === 'GET' &&
      url.pathname.startsWith('/api/') &&
      !url.pathname.startsWith('/api/auth/'),
    handler: 'NetworkFirst',
    options: {
      cacheName: 'apis',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 86400,
      },
      networkTimeoutSeconds: 3,
    },
  },
  {
    urlPattern: /\/_next\/static.+\.js$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'next-static-js-assets',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 31536000,
      },
    },
  },
  {
    urlPattern: /\.(?:css|less)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-style-assets',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 31536000,
      },
    },
  },
  {
    urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'static-font-assets',
      expiration: {
        maxEntries: 16,
        maxAgeSeconds: 31536000,
      },
    },
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  reactStrictMode: process.env.NODE_ENV === 'production',
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@tanstack/react-query',
      'socket.io-client',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
  images: {
    unoptimized: true,
  },
}

const withPWA = createPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    runtimeCaching: customRuntimeCaching,
  },
  extendDefaultRuntimeCaching: true,
})

const isProduction = process.env.NODE_ENV === 'production'

export default isProduction ? withPWA(nextConfig) : nextConfig
