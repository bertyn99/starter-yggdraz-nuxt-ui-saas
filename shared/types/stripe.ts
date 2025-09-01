// Plan types based on Stripe lookup keys
export type SubscriptionPlan = 'plus' | 'pro' | 'enterprise'

// Plan mapping from Stripe lookup keys to internal plan names
const PLAN_MAPPING: Record<string, SubscriptionPlan> = {
  plus: 'plus',
  pro: 'pro',
  enterprise: 'enterprise'
}

// Default plan fallback
const DEFAULT_PLAN: SubscriptionPlan = 'plus'
