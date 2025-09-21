import type { H3Event, EventHandlerRequest } from 'h3'
import { useServerStripe } from '#stripe/server'
import { users } from '#layers/auth/server/db/schemas/auth-schema'
import { eq } from 'drizzle-orm'

export async function getOrCreateCustomerId(user: { id: string, email?: string, name?: string }, event: H3Event<EventHandlerRequest>): Promise<string | null> {
  // Check DB for existing customer id
  const existing = await useDB().query.users.findFirst({
    where: eq(users.id, user.id)
  })
  if (!existing) return null

  if (existing.stripeCustomerId) {
    return existing.stripeCustomerId
  }

  const stripe = await useServerStripe(event)
  const customer = await stripe.customers.create({
    email: existing.email || user.email,
    name: (existing as any).firstName || user.name,
    metadata: { userId: String(user.id) }
  })

  await useDB().update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, user.id))

  return customer.id
}
