// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui-pro', '@nuxt/eslint', 'nuxt-auth-utils', '@nuxt/image', '@nuxt/content', '@nuxtjs/seo', 'nuxt-security'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  content: {
    database: {
      type: 'sqlite',
      filename: './server/db/data.db'
    }
  },

  runtimeConfig: {
    cookie: {
      httpOnly: true,
      secure: true, // work with https
      sameSite: 'strict'
    }
  },
  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2024-10-17',
  nitro: {
    experimental: {
      database: true,
      tasks: true
    },
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },
  /*   security: {
      csrf: true,
    }, */
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
