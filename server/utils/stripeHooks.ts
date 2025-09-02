import { and, eq } from 'drizzle-orm'
import { users } from '~~/server/db/schemas/auth-schema'
import { subscriptions } from '~~/server/db/schemas/subscription'
import { STRIPE_LOOKUP_TO_PLAN, DEFAULT_PLAN } from '../../shared/plans'
import type { H3Event, EventHandlerRequest } from 'h3'

function extractPlanFromStripe(stripeData: any): string {
  try {
    // Try to get plan from lookup_key first
    if (stripeData.items?.data?.[0]?.price?.lookup_key) {
      const lookupKey = stripeData.items.data[0].price.lookup_key
      if (STRIPE_LOOKUP_TO_PLAN[lookupKey]) {
        return STRIPE_LOOKUP_TO_PLAN[lookupKey]
      }
    }

    // Fallback to metadata or other fields
    if (stripeData.metadata?.plan && STRIPE_LOOKUP_TO_PLAN[stripeData.metadata.plan]) {
      return STRIPE_LOOKUP_TO_PLAN[stripeData.metadata.plan]
    }

    // Final fallback
    return DEFAULT_PLAN
  } catch {
    return DEFAULT_PLAN
  }
}

// Helper function to extract period end from Stripe data
function extractPeriodEndFromStripe(stripeData: any): Date | null {
  try {
    if (stripeData.current_period_end) {
      return new Date(stripeData.current_period_end * 1000)
    }
    if (stripeData.lines?.data?.[0]?.period?.end) {
      return new Date(stripeData.lines.data[0].period.end * 1000)
    }
    return null
  } catch {
    return null
  }
}

export async function onCheckoutSessionCompleted(session: any) {
  const stripeCustomerId = session.customer
  const stripeSubscriptionId = session.subscription
  const periodEnd = extractPeriodEndFromStripe(session)
  const plan = extractPlanFromStripe(session)

  const user = await useDB().query.users.findFirst({
    where: eq(users.stripeCustomerId, stripeCustomerId)
  })

  if (!user) {
    console.error('User not found for Stripe customer ID:', stripeCustomerId)
    return
  }

  await useDB().insert(subscriptions).values({
    referenceId: user.id,
    stripeCustomerId: stripeCustomerId,
    stripeSubscriptionId: stripeSubscriptionId,
    plan: plan,
    status: 'active',
    periodEnd: periodEnd
  }).onConflictDoUpdate({
    target: subscriptions.referenceId,
    set: {
      stripeSubscriptionId,
      plan: plan,
      status: 'active',
      periodEnd: periodEnd
    }
  })
}

export async function onInvoicePaymentSucceeded(invoice: any) {
  const stripeSubscriptionId = invoice.subscription
  const periodEnd = extractPeriodEndFromStripe(invoice)
  if (periodEnd) {
    await useDB().update(subscriptions)
      .set({ periodEnd: periodEnd })
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
  }
}

export async function onCustomerSubscriptionDeleted(event: any) {
  const subscription = event.data.object
  const stripeSubscriptionId = subscription.id

  console.log('subscription canceled')
  await useDB().update(subscriptions)
    .set({ status: 'canceled' })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
}

export async function onCustomerSubscriptionUpdated(event: any) {
  const subscription = event.data.object
  const stripeSubscriptionId = subscription.id
  const plan = extractPlanFromStripe(subscription)
  const periodEnd = extractPeriodEndFromStripe(subscription)

  const updateData: any = {
    plan: plan
  }

  if (periodEnd) {
    updateData.periodEnd = periodEnd
  }
  await useDB().update(subscriptions)
    .set(updateData)
    .where(and(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId)))
}

export async function updateUserSessionSubFromCustomerId(event: H3Event<EventHandlerRequest>, customerId: string, subsValue: boolean = true) {
  const user = await useDB().query.users.findFirst({
    where: eq(users.stripeCustomerId, customerId)
  })

  if (!user) {
    console.error('User not found for Stripe customer ID:', customerId)
    return
  }

  console.log('Update the user session')
  const session = await getUserSession(event)
  console.log(session)
}

export const stripeHooks = {
  onCheckoutSessionCompleted,
  onInvoicePaymentSucceeded,
  onCustomerSubscriptionDeleted,
  onCustomerSubscriptionUpdated
}
