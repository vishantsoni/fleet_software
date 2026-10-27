/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      matcher: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      options: {
        cacheName: 'gstatic-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      matcher: /^https:\/\/api\.mapbox\.com\/.*/i,
      options: {
        cacheName: 'mapbox',
        expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      matcher: ({ url, sameOrigin }) => {
        const pathname = url.pathname || ''
        return sameOrigin && pathname.startsWith('/_next/image')
      },
      options: {
        cacheName: 'next-image',
        expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      matcher: ({ url, sameOrigin }) => {
        const pathname = url.pathname || ''
        return sameOrigin && !pathname.startsWith('/api') && (
          pathname.startsWith('/_next/static') ||
          pathname.startsWith('/static') ||
          /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/.test(pathname)
        )
      },
      options: {
        cacheName: 'assets',
        expiration: { maxEntries: 64, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      matcher: ({ url, sameOrigin }) => {
        const pathname = url.pathname || ''
        return sameOrigin && pathname.startsWith('/api/')
      },
      options: {
        cacheName: 'api',
        expiration: { maxEntries: 32, maxAgeSeconds: 5 * 60 },
        networkTimeoutSeconds: 10,
        strategies: 'StaleWhileRevalidate',
      },
    },
    {
      matcher: ({ url, sameOrigin }) => {
        const pathname = url.pathname || ''
        return sameOrigin && /^\/(?!api\/)(?!_next\/).*/.test(pathname)
      },
      options: {
        cacheName: 'pages',
        expiration: { maxEntries: 32, maxAgeSeconds: 60 },
        networkTimeoutSeconds: 10,
        strategies: 'StaleWhileRevalidate',
      },
    },
  ],
})

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  reactStrictMode: true,
}

module.exports = withPWA(nextConfig)
