// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  nitro: {
    experimental: {
      database: true,
    },
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },
  future: {
    compatibilityVersion: 4,
  },
  css: ['~/assets/css/main.css'],
  modules: ["@nuxt/ui-pro", '@nuxt/eslint', "nuxt-auth-utils", '@nuxt/image', '@nuxt/content', '@nuxtjs/seo', "nuxt-security"],
  compatibilityDate: "2024-10-17",

  runtimeConfig: {
    cookie: {
      httpOnly: true,
      secure: true, //work with https
      sameSite: "strict",
    },
  },
  content: {
    database: {
      type: 'sqlite',
      filename: 'SQLITE_DB_LOCATION'
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
});
