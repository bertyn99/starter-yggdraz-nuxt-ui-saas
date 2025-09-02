/**
 * Get active subscription for a user from database
 */
export async function getActiveSubscriptionForUser(userId: string) {
  try {
    const subscription = await useDB().query.subscriptions.findFirst({
      where: eq(subscriptions.referenceId, userId),
      orderBy: [subscriptions.createdAt]
    })

    return subscription
  } catch (error) {
    console.error('Error fetching subscription for user:', userId, error)
    return null
  }
}

/**
   * Normalize subscription data for session
   */
export function normalizeSubscription(dbSubscription: any): NormalizedSubscription {
  if (!dbSubscription) {
    return {
      isActive: false,
      plan: DEFAULT_PLAN,
      status: 'none',
      periodEnd: null,
      trialEnd: null,
      cancelAtPeriodEnd: false,
      seats: null
    }
  }

  const now = new Date()
  const isActive = isSubscriptionActive(dbSubscription, now)

  return {
    isActive,
    plan: (dbSubscription.plan as SubscriptionPlan) || DEFAULT_PLAN,
    status: dbSubscription.status || 'incomplete',
    periodEnd: dbSubscription.periodEnd,
    trialEnd: dbSubscription.trialEnd,
    cancelAtPeriodEnd: dbSubscription.cancelAtPeriodEnd || false,
    seats: dbSubscription.seats
  }
}

/**
   * Check if subscription is active based on status and dates
   */
export function isSubscriptionActive(subscription: any, now: Date = new Date()): boolean {
  if (!subscription) return false

  const activeStatuses = ['active', 'trialing', 'past_due'] // past_due gives grace period
  const hasActiveStatus = activeStatuses.includes(subscription.status)

  if (!hasActiveStatus) return false

  // Check if period has ended
  if (subscription.periodEnd && subscription.periodEnd <= now) {
    return false
  }

  // Check if trial has ended
  if (subscription.trialEnd && subscription.trialEnd <= now) {
    return false
  }

  // Check if canceled at period end
  if (subscription.cancelAtPeriodEnd && subscription.periodEnd && subscription.periodEnd <= now) {
    return false
  }

  return true
}

/**
   * Get entitlements for a plan
   */
export function getSubscriptionEntitlements(plan: SubscriptionPlan) {
  return getEntitlements(plan)
}

/**
   * Get full subscription with entitlements for session
   */
export function getSubscriptionWithEntitlements(dbSubscription: any): SubscriptionWithEntitlements {
  const normalized = normalizeSubscription(dbSubscription)
  return {
    ...normalized,
    entitlements: getSubscriptionEntitlements(normalized.plan)
  }
}
