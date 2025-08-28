
import { useServerStripe } from '#stripe/server'
import { subscriptions, users } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
    const { user, secure } = await requireUserSession(event)

    if (!user || !secure || !secure.stripeCustomerId) {
        if (!secure!.stripeCustomerId) {
            // Fetch the user from the database
            const stripeCustomerId = await getOrCreateCustomerId(user, event)

            if (!stripeCustomerId) {
                throw createError({ statusCode: 400, statusMessage: 'Customer not found' })
            }
            secure!.stripeCustomerId = stripeCustomerId
        }
    }
    try {
        const stripe = await useServerStripe(event)

        const host = getRequestURL(event).origin || 'http://localhost:3000'

        if (!user.isSubscribed) {
            // If the user is not subscribed, redirect to the subscription page
            // Create Checkout Session
            const checkoutSession = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer: secure!.stripeCustomerId,
                mode: 'subscription',
                billing_address_collection: 'auto',
                success_url: `${host}/dashboard/profile/subscription?session_id={CHECKOUT_SESSION_ID}`,
            })

            return { url: checkoutSession.url }
        }

        // Create a Customer Portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: secure!.stripeCustomerId,
            return_url: `${host}/dashboard/profile/subscription`,
        })

        return { url: portalSession.url }
    }
    catch (error) {
        console.error('Error creating customer portal session:', error)
        throw createError({ statusCode: 500, statusMessage: 'Failed to create customer portal session' })
    }
})