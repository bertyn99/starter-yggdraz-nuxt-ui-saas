import { defineNuxtModule, addServerHandler, createResolver } from '@nuxt/kit'

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
  setup(options) {
    const { resolve } = createResolver(import.meta.url)

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
  }
})
