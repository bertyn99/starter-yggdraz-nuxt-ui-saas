import { useServerStripe } from '#stripe/server'
import { subscriptions, users } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { lookup_key } = body
        const stripe = await useServerStripe(event)
        console.log('back', lookup_key)
        // Assuming you have a way to get the authenticated user
        const { user } = await requireUserSession(event)

        // Fetch the user from the database
        const userFromDB = await useDrizzle().query.users.findFirst({
            where: eq(users.id, user.id),
        })

        if (!userFromDB) {
            throw createError({ statusCode: 404, statusMessage: 'User not found' })
        }

        // Get or create Stripe Customer ID
        const stripeCustomerId = await getOrCreateCustomerId(userFromDB, event)

        const host = getRequestURL(event).origin || 'http://localhost:3000'

        const subscribed = await useDrizzle().query.subscriptions.findFirst({
            where: eq(subscriptions.userId, user.id),
        })

        if (stripeCustomerId) {
            // get price of the plan selected
            const prices = await stripe.prices.list({
                lookup_keys: [body.lookup_key],
                expand: ['data.product'],
            })

            // Create Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer: stripeCustomerId,
                mode: 'subscription',
                billing_address_collection: 'auto',
                line_items: [
                    {
                        price: prices.data[prices.data.length - 1].id,
                        quantity: 1,
                    },
                ],
                success_url: `${host}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${host}/subscription/cancel`,
            })

            return { url: session.url }
        }
        else {
            throw createError('NO customer ID')
        }
    }

    catch (error: any) {
        console.log(error)
    }
})