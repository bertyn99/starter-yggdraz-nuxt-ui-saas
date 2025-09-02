import { defineEventHandler, createError, getRequestURL } from 'h3'
import { useServerStripe } from '#stripe/server'
import { getOrCreateCustomerId } from '../utils/customer'

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  if (!secure || !secure.stripeCustomerId) {
    const stripeCustomerId = await getOrCreateCustomerId(user, event)
    if (!stripeCustomerId) {
      throw createError({ statusCode: 400, statusMessage: 'Customer not found' })
    }
    // Best effort: attach to session secure if available
    if (secure) {
      secure.stripeCustomerId = stripeCustomerId
    }
  }

  try {
    const stripe = await useServerStripe(event)
    const host = getRequestURL(event).origin || 'http://localhost:3000'

    if (!user.isSubscribed) {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: secure!.stripeCustomerId,
        mode: 'subscription',
        billing_address_collection: 'auto',
        success_url: `${host}/dashboard/profile/subscription?session_id={CHECKOUT_SESSION_ID}`
      })
      return { url: checkoutSession.url }
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: secure!.stripeCustomerId,
      return_url: `${host}/dashboard/profile/subscription`
    })

    return { url: portalSession.url }
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to create customer portal session' })
  }
})
