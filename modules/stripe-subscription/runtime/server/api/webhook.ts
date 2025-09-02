import { defineEventHandler, readRawBody, getHeader, createError } from 'h3'
import { useServerStripe } from '#stripe/server'
import { useRuntimeConfig } from '#imports'
import { onCheckoutSessionCompleted, onInvoicePaymentSucceeded, onCustomerSubscriptionDeleted, onCustomerSubscriptionUpdated, updateUserSessionSubFromCustomerId } from '../utils/stripeHooks'

export default defineEventHandler(async (event) => {
  const stripe = await useServerStripe(event)
  const config = useRuntimeConfig()
  const sig = getHeader(event, 'stripe-signature') ?? ''
  const webhookSecret = config.stripeWebhookSecret
  let stripeEvent

  try {
    const rawBody = (await readRawBody(event)) as string | Buffer<ArrayBufferLike>
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed.', err)
    return createError({ statusCode: 400, statusMessage: 'Invalid signature' })
  }

  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object
      await onCheckoutSessionCompleted(session)
      await updateUserSessionSubFromCustomerId(event, session?.customer)
      break
    }
    case 'invoice.payment_succeeded': {
      const invoice = stripeEvent.data.object
      await onInvoicePaymentSucceeded(invoice)
      break
    }
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
