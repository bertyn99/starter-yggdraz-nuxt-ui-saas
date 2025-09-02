import { inArray } from 'drizzle-orm'
import { subscriptions } from '~~/server/db/schemas/subscription'
import { users } from '~~/server/db/schemas/auth-schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  // Get the user's subscription
  const subscription = await useDB().query.subscriptions.findFirst({
    where: and(eq(subscriptions.userId, user.id), inArray(subscriptions.status, ['active', 'unpaid']))
  })

  return subscription
})
