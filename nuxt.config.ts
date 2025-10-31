// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/main.scss'],
  
  // GitHub Pages configuration
  app: {
    baseURL: '/showmeamovie/',
    buildAssetsDir: 'assets',
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ]
    }
  },
  
  // Disable server-side rendering for static hosting
  ssr: false,
  
  runtimeConfig: {
    // Private keys are only available on the server
    // apiSecret: process.env.API_SECRET,
    
    // Public keys that are exposed to the client
    public: {
      apiKey: process.env.NUXT_API_KEY || process.env.NUXT_PUBLIC_API_KEY
    }
  },
  
  modules: ['nuxt-icon']
})