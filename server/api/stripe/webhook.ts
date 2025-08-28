// server/api/stripe-webhook.ts
import { defineEventHandler, readRawBody, sendError } from 'h3'
import type { H3Event, EventHandlerRequest } from 'h3'
import { users, subscriptions } from '~~/server/db/schema'
import { useServerStripe } from '#stripe/server'
import { and, eq } from 'drizzle-orm'


export default defineEventHandler(async (event) => {
    const stripe = await useServerStripe(event) // Add this to your environment variables
    const config = useRuntimeConfig()
    const sig = getHeader(event, 'stripe-signature') ?? ''
    const webhookSecret = config.stripeWebhookSecret // Add this to your environment variables
    let stripeEvent

    try {
        const rawBody = (await readRawBody(event)) as string | Buffer<ArrayBufferLike>
        stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    }
    catch (err) {
        console.error(`Webhook signature verification failed.`, err)
        return createError({ statusCode: 400, statusMessage: 'Invalid signature' })
    }

    // Handle the event
    switch (stripeEvent.type) {
        case 'checkout.session.completed':
            const session = stripeEvent.data.object
            const u = await handleCheckoutSessionCompleted(session)
            // update the user subscription in the session
            await updateUserSessionSubFromCustomerId(event, session?.customer)
            break

        case 'invoice.payment_succeeded':
            const invoice = stripeEvent.data.object
            await handleInvoicePaymentSucceeded(invoice)
            break

        case 'customer.subscription.deleted':
            await handleCustomerSubscriptionDeleted(stripeEvent)
            break

        case 'customer.subscription.updated':
            await handleCustomerSubscriptionUpdated(stripeEvent)
            break

        default:
            console.warn(`Unhandled event type ${stripeEvent.type}`)
    }

    return { received: true }
})

async function handleCheckoutSessionCompleted(session: any) {
    const stripeCustomerId = session.customer
    const stripeSubscriptionId = session.subscription

    // Find the user by Stripe Customer ID
    const user = await useDB().query.users.findFirst({
        where: eq(users.stripeCustomerId, stripeCustomerId),
    })

    if (!user) {
        console.error('User not found for Stripe customer ID:', stripeCustomerId)
        return
    }

    // Retrieve subscription details from Stripe if needed
    // Alternatively, extract plan information from the session or metadata

    // Insert a new subscription record
    await useDB().insert(subscriptions).values({
        userId: user.id,
        stripeSubscriptionId: stripeSubscriptionId,
        plan: 'student', // Extract plan based on priceId or session metadata
        status: 'active',
        currentPeriodEnd: new Date(session.current_period_end * 1000), // Convert Unix timestamp
    }).onConflictDoUpdate({
        target: subscriptions.userId,
        set: {
            stripeSubscriptionId,
            plan: 'student',
            status: 'active',
            currentPeriodEnd: new Date(session.current_period_end * 1000),
        },
    })
}

async function handleInvoicePaymentSucceeded(invoice: any) {
    const stripeSubscriptionId = invoice.subscription

    // Update the subscription's period end date
    await useDB().update(subscriptions)
        .set({ currentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000) })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
}

async function handleCustomerSubscriptionDeleted(event: any) {
    const subscription = event.data.object
    const stripeSubscriptionId = subscription.id

    console.log('subscription canceled')
    // Update the subscription status
    await useDB().update(subscriptions)
        .set({ status: 'canceled' })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
}

async function handleCustomerSubscriptionUpdated(event: any) {
    const subscription = event.data.object
    const stripeSubscriptionId = subscription.id
    const plan = subscription.items.data[0].price.lookup_key

    // Update the subscription plan
    await useDB().update(subscriptions)
        .set({ plan })
        .where(and(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId)))
}

async function updateUserSessionSubFromCustomerId(event: H3Event<EventHandlerRequest>, customerId: string, subsValue: boolean = true) {
    const user = await useDB().query.users.findFirst({
        where: eq(users.stripeCustomerId, customerId),
    })

    if (!user) {
        console.error('User not found for Stripe customer ID:', customerId)
        return
    }
    console.log('Update the user session')
    /*  await setUserSession(event, {
      user: {
        isSubscribed: subsValue,
        id: user.id,
        username: user.username,
      },
    }) */

    // Get the current user session
    const session = await getUserSession(event)
    console.log(session)
}