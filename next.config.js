/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gstatic-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'mapbox',
        expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: ({ url, sameOrigin }) => {
        const pathname = url.pathname || ''
        return sameOrigin && pathname.startsWith('/_next/image')
      },
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: ({ url, sameOrigin }) => {
        const pathname = url.pathname || ''
        return sameOrigin && !pathname.startsWith('/api') && (
          pathname.startsWith('/_next/static') ||
          pathname.startsWith('/static') ||
          /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/.test(pathname)
        )
      },
      handler: 'CacheFirst',
      options: {
        cacheName: 'assets',
        expiration: { maxEntries: 64, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: ({ url, sameOrigin }) => {
        const pathname = url.pathname || ''
        return sameOrigin && pathname.startsWith('/api/')
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api',
        expiration: { maxEntries: 32, maxAgeSeconds: 5 * 60 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: ({ url, sameOrigin }) => {
        const pathname = url.pathname || ''
        return sameOrigin && /^\/(?!api\/)(?!_next\/).*/.test(pathname)
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: { maxEntries: 32, maxAgeSeconds: 60 },
        networkTimeoutSeconds: 10,
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
  // TODO: ~27 pre-existing type errors remain (see `npx tsc --noEmit`)
  typescript: { ignoreBuildErrors: true },
}

module.exports = withPWA(nextConfig)
