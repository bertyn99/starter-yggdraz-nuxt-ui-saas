import { defineNuxtModule, addServerHandler, createResolver, addImportsDir, installModule } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * API route base for Stripe endpoints
   */
  routeBase: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'stripe-subscription',
    configKey: 'stripeSubscription'
  },
  defaults: {
    routeBase: '/api/stripe'
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    await installModule('@unlok-co/nuxt-stripe', {
      // module configuration
      exposeConfig: true
    })

    // Auto-import composables from this module
    addImportsDir(resolve('./runtime/composable'))
    // Webhook endpoint
    addServerHandler({
      route: `${options.routeBase}/webhook`,
      handler: resolve('./runtime/server/api/webhook')
    })

    // Create Checkout Session endpoint
    addServerHandler({
      route: `${options.routeBase}/create-checkout-session`,
      handler: resolve('./runtime/server/api/create-checkout-session'),
      method: 'post'
    })

    // Customer Portal endpoint
    addServerHandler({
      route: `${options.routeBase}/create-customer-portal`,
      handler: resolve('./runtime/server/api/create-customer-portal'),
      method: 'post'
    })

    // Get current subscription endpoint
    addServerHandler({
      route: `${options.routeBase}/subscription`,
      handler: resolve('./runtime/server/api/subscription')
    })

    // get subsrcription example page
    nuxt.hook('pages:extend', (pages) => {
      pages.push({
        name: 'dashboard-subscription',
        path: '/dashboard/subscription',
        file: resolve(__dirname, './runtime/pages/example-subscription.vue')
      })
      pages.push({
        name: 'dashboard-subscription-success',
        path: '/dashboard/subscription/success',
        file: resolve(__dirname, './runtime/pages/subscription/success.vue')
      })
      pages.push({
        name: 'dashboard-subscription-error',
        path: '/dashboard/subscription/error',
        file: resolve(__dirname, './runtime/pages/subscription/cancel.vue')
      })
    })
  }
})
