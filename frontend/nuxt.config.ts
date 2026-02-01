export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@vueuse/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.VITE_API_BASE || 'http://localhost:5001/api/v1',
      appName: 'RBSE Digital Library',
      schoolName: process.env.NUXT_PUBLIC_SCHOOL_NAME || 'RBSE Model School'
    }
  },

  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en.json'
      },
      {
        code: 'hi',
        name: 'हिंदी',
        file: 'hi.json'
      }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  app: {
    head: {
      title: 'RBSE Digital Library',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Digital Library Management System for RBSE Schools' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  ssr: false,

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: []
    }
  },

  ui: {
    icons: ['heroicons', 'mdi']
  },

  compatibilityDate: '2024-01-28'
})
