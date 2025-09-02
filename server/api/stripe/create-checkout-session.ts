import { useServerStripe } from '#stripe/server'
import { subscriptions } from '~~/server/db/schemas/subscription'
import { users } from '~~/server/db/schemas/auth-schema'
import { STRIPE_LOOKUP_TO_PLAN } from '#/shared/types/stripe'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { lookup_key } = body
    const stripe = await useServerStripe(event)

    console.log('Creating checkout session for lookup_key:', lookup_key)

    // Get authenticated user
    const { user } = await requireUserSession(event)

    // Fetch the user from the database
    const userFromDB = await useDB().query.users.findFirst({
      where: eq(users.id, user.id)
    })

    if (!userFromDB) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // Get or create Stripe Customer ID (you'll need to implement this function)
    // For now, we'll assume the user has a stripeCustomerId
    const stripeCustomerId = userFromDB.stripeCustomerId

    if (!stripeCustomerId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User does not have a Stripe customer ID. Please contact support.'
      })
    }

    const host = getRequestURL(event).origin || 'http://localhost:3000'

    // Check if user already has a subscription (optional - for UI feedback)
    const _existingSubscription = await useDB().query.subscriptions.findFirst({
      where: eq(subscriptions.referenceId, user.id)
    })

    // Get price of the plan selected
    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ['data.product']
    })

    if (!prices.data.length) {
      throw createError({
        statusCode: 400,
        statusMessage: `Price not found for lookup_key: ${lookup_key}`
      })
    }

    // Validate that the lookup_key maps to a valid plan
    if (!STRIPE_LOOKUP_TO_PLAN[lookup_key]) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid plan lookup_key: ${lookup_key}`
      })
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      mode: 'subscription',
      billing_address_collection: 'auto',
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1
        }
      ],
      success_url: `${host}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${host}/subscription/cancel`,
      metadata: {
        plan: STRIPE_LOOKUP_TO_PLAN[lookup_key],
        userId: user.id
      }
    })

    return { url: session.url }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create checkout session'
    })
  }
})
