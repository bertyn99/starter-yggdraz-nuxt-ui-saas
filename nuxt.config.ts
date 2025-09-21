import { defineOrganization } from 'nuxt-schema-org/schema'


// https://nuxt.com/docs/api/configuration/nuxt-config
const isProd = process.env.NODE_ENV === 'production'
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui-pro',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/content',
    '@nuxtjs/seo',
    'nuxt-security',
    // Local module to centralize Stripe subscription logic
    './modules/stripe-subscription',

  ],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  extends: [
    './layers/auth',
  ],
  // Nuxt Site Config (via @nuxtjs/seo)
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'Acme',
    description: 'Modern SaaS platform built with cutting-edge technology.',
    indexable: isProd
  },
  content: {
    database: {
      type: 'sqlite',
      filename: './server/db/data.db'
    }
  },

  runtimeConfig: {
    session: {
      maxAge: 60 * 60 * 24 * 3, // 3 days
      cookie: {
        httpOnly: true,
        secure: true, // work with https
        sameSite: 'strict'
      },
    },
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET_KEY,
    stripe: {
      key: process.env.STRIPE_SECRET_KEY,
      options: {}
    },
    // Client
    public: {
      stripe: {
        key: process.env.STRIPE_PUBLIC_KEY,
        options: {}
      }
    }
  },
  // In non-production, prevent indexing via route rules
  routeRules: isProd
    ? {}
    : {
      '/**': {
        robots: { index: false, follow: false }
      }
    },
  future: {
    compatibilityVersion: 4
  },
  schemaOrg: {
    identity: defineOrganization({
      // Basic Information
      name: 'Acme',
      logo: '/Acme logo.svg',
    })
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
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  security: {
    ssg: {
      hashScripts: false // Disable hashes because they would cancel 'unsafe-inline'
    },
    headers: {
      contentSecurityPolicy: {
        'script-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\'']
      }
    }
    /*  csrf: true,
     crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
    contentSecurityPolicy: {
      'base-uri': ["'self'"],
      'font-src': ["'self'", 'https:', 'data:'],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'object-src': ["'none'"],
      'script-src-attr': ["'none'"],
      'style-src': ["'self'", 'https:', "'unsafe-inline'"],
      'script-src': ["'self'", 'https:'],
      'upgrade-insecure-requests': true
    } */
  },

  // Nuxt Sitemap (enabled by @nuxtjs/seo) — rely on sensible defaults
  sitemap: {
    exclude: [
      '/dashboard/**',
      'subscription/cancel',
      'subscription/success'
      /* 'subscription/pay', */
    ]
  },
  /*  authCore: {
     sessionRules: {
       expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
       updateAge: 24 * 60 * 60, // 1 day in seconds
       freshAge: 24 * 60 * 60, // 1 day in seconds
       maxSessions: 10,
       cleanupInterval: 60 * 60, // 1 hour in seconds
       trackActivity: true,
       requireFreshness: false,
       disableSessionRefresh: false,
       cookieCache: {
         enabled: false,
         maxAge: 5 * 60 // 5 minutes in seconds
       }
     },
     // Database adapter configuration
     database: {
       // Use the default 'useDB' function from your app
       adapterFunction: 'useDB'
 
     }
   }, */
})
