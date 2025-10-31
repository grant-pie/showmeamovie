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
        { rel: 'icon', type: 'image/x-icon', href: '/showmeamovie/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/showmeamovie/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/showmeamovie/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/showmeamovie/favicon-16x16.png' },
        { rel: 'manifest', href: '/showmeamovie/site.webmanifest' }
      ]
    }
  },
  
  // Disable server-side rendering for static hosting
  ssr: false,
  
  runtimeConfig: {
    public: {
      apiKey: process.env.NUXT_API_KEY || process.env.NUXT_PUBLIC_API_KEY
    }
  },
  
  modules: ['nuxt-icon']
})