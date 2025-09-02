import { defineEventHandler } from 'h3'
import { and, eq, inArray } from 'drizzle-orm'
import { subscriptions } from '~~/server/db/schemas/subscription'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const sub = await useDB().query.subscriptions.findFirst({
    where: and(eq(subscriptions.referenceId, user.id), inArray(subscriptions.status, ['active', 'unpaid']))
  })
  return sub
})
