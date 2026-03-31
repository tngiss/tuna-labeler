import { defineNuxtConfig } from 'nuxt/config'
import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: false,
  nitro: {
    output: {
      publicDir: '../admin/server/.output/public/labeler'
    }
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_API_URL
    }
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'TUNA LABELER',
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com'
        }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    baseURL: '/labeler/'
  },
  build: {
    transpile: ['vuetify']
  },
  modules: ['@pinia/nuxt'],
  hooks: {
    'vite:extendConfig': (config) => {
      config.plugins!.push(vuetify())
    }
  },
  vite: {
    ssr: {
      noExternal: ['vuetify']
    },
    define: {
      'process.env.DEBUG': false
    }
  },
  css: ['@/assets/css/main.scss', 'nprogress/nprogress.css']
})
