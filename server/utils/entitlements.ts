// server/utils/entitlements.ts
import type { H3Event } from 'h3'
import type { SubscriptionPlan } from '~/shared/plans'
import { isAtLeast } from '~/shared/plans'

interface PlanRequirement {
  atLeast?: SubscriptionPlan
  exact?: SubscriptionPlan
  feature?: string
}

interface LimitCheck {
  key: string
  getCurrentUsage: () => Promise<number>
  errorMessage?: string
}

/**
 * Require a specific plan level or feature
 */
export async function requirePlan(event: H3Event, requirement: PlanRequirement) {
  const session = await getUserSession(event)

  if (!session?.subscription) {
    throw createError({
      statusCode: 403,
      message: 'Subscription required'
    })
  }

  const { subscription } = session

  // Check if subscription is active
  if (!subscription.isActive) {
    throw createError({
      statusCode: 403,
      message: 'Active subscription required'
    })
  }

  // Check minimum plan requirement
  if (requirement.atLeast && !isAtLeast(subscription.plan, requirement.atLeast)) {
    throw createError({
      statusCode: 403,
      message: `${requirement.atLeast} plan or higher required`
    })
  }

  // Check exact plan requirement
  if (requirement.exact && subscription.plan !== requirement.exact) {
    throw createError({
      statusCode: 403,
      message: `${requirement.exact} plan required`
    })
  }

  // Check feature requirement
  if (requirement.feature && !subscription.entitlements.features[requirement.feature]) {
    throw createError({
      statusCode: 403,
      message: `Feature "${requirement.feature}" not available on current plan`
    })
  }

  return session
}

/**
 * Check if user has exceeded a limit
 */
export async function checkLimit(event: H3Event, check: LimitCheck) {
  const session = await getUserSession(event)

  if (!session?.subscription) {
    throw createError({
      statusCode: 403,
      message: 'Subscription required'
    })
  }

  const { subscription } = session
  const limit = subscription.entitlements.limits[check.key]

  // Unlimited
  if (limit === -1) {
    return true
  }

  const currentUsage = await check.getCurrentUsage()

  if (currentUsage >= limit) {
    throw createError({
      statusCode: 429,
      message: check.errorMessage || `Limit exceeded for ${check.key}`
    })
  }

  return true
}

/**
 * Get current usage for a limit
 */
export async function getCurrentUsage(event: H3Event, key: string, getUsage: () => Promise<number>) {
  const session = await getUserSession(event)

  if (!session?.subscription) {
    return 0
  }

  return await getUsage()
}

/**
 * Get remaining limit for a key
 */
export async function getRemainingLimit(event: H3Event, key: string, getUsage: () => Promise<number>) {
  const session = await getUserSession(event)

  if (!session?.subscription) {
    return 0
  }

  const limit = session.subscription.entitlements.limits[key]
  if (limit === -1) return -1 // unlimited

  const usage = await getUsage()
  return Math.max(0, limit - usage)
}
