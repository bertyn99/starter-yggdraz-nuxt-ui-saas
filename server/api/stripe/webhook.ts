// server/api/stripe-webhook.ts
import { defineEventHandler, readRawBody, sendError } from 'h3'
import { useServerStripe } from '#stripe/server'
import { onCheckoutSessionCompleted, onInvoicePaymentSucceeded, onCustomerSubscriptionDeleted, onCustomerSubscriptionUpdated, updateUserSessionSubFromCustomerId } from '~~/server/utils/stripeHooks'

export default defineEventHandler(async (event) => {
  const stripe = await useServerStripe(event) // Add this to your environment variables
  const config = useRuntimeConfig()
  const sig = getHeader(event, 'stripe-signature') ?? ''
  const webhookSecret = config.stripeWebhookSecret // Add this to your environment variables
  let stripeEvent

  try {
    const rawBody = (await readRawBody(event)) as string | Buffer<ArrayBufferLike>
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err)
    return createError({ statusCode: 400, statusMessage: 'Invalid signature' })
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      const session = stripeEvent.data.object
      const u = await onCheckoutSessionCompleted(session)
      // update the user subscription in the session
      await updateUserSessionSubFromCustomerId(event, session?.customer)
      break

    case 'invoice.payment_succeeded':
      const invoice = stripeEvent.data.object
      await onInvoicePaymentSucceeded(invoice)
      break

    case 'customer.subscription.deleted':
      await onCustomerSubscriptionDeleted(stripeEvent)
      break

    case 'customer.subscription.updated':
      await onCustomerSubscriptionUpdated(stripeEvent)
      break

    default:
      console.warn(`Unhandled event type ${stripeEvent.type}`)
  }

  return { received: true }
})
