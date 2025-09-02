// shared/plans.ts
export type SubscriptionPlan = 'free' | 'plus' | 'pro' | 'enterprise'

export const PLAN_ORDER: SubscriptionPlan[] = ['free', 'plus', 'pro', 'enterprise']

export const PLAN_CONFIG: Record<SubscriptionPlan, {
  features: Record<string, boolean>
  limits: Record<string, number>
}> = {
  free: {
    features: {
      basicAnalytics: true,
      basicSupport: true,
      apiAccess: false,
      teamCollaboration: false,
      advancedSecurity: false,
      customBranding: false,
      prioritySupport: false,
      sso: false
    },
    limits: {
      projects: 3,
      teamMembers: 1,
      apiRequests: 1000,
      storage: 1, // GB
      integrations: 2
    }
  },
  plus: {
    features: {
      basicAnalytics: true,
      basicSupport: true,
      apiAccess: true,
      teamCollaboration: false,
      advancedSecurity: false,
      customBranding: false,
      prioritySupport: false,
      sso: false
    },
    limits: {
      projects: 10,
      teamMembers: 3,
      apiRequests: 10000,
      storage: 10, // GB
      integrations: 10
    }
  },
  pro: {
    features: {
      basicAnalytics: true,
      basicSupport: true,
      apiAccess: true,
      teamCollaboration: true,
      advancedSecurity: true,
      customBranding: false,
      prioritySupport: false,
      sso: false
    },
    limits: {
      projects: 50,
      teamMembers: 10,
      apiRequests: 100000,
      storage: 100, // GB
      integrations: 50
    }
  },
  enterprise: {
    features: {
      basicAnalytics: true,
      basicSupport: true,
      apiAccess: true,
      teamCollaboration: true,
      advancedSecurity: true,
      customBranding: true,
      prioritySupport: true,
      sso: true
    },
    limits: {
      projects: -1, // unlimited
      teamMembers: -1, // unlimited
      apiRequests: -1, // unlimited
      storage: -1, // unlimited
      integrations: -1 // unlimited
    }
  }
}

// Maps Stripe price lookup_key to internal plan names
export const STRIPE_LOOKUP_TO_PLAN: Record<string, SubscriptionPlan> = {
  plus: 'plus',
  pro: 'pro',
  enterprise: 'enterprise'
}

export const DEFAULT_PLAN: SubscriptionPlan = 'free'

// Utility helpers
export function comparePlans(a: SubscriptionPlan, b: SubscriptionPlan): number {
  const aIndex = PLAN_ORDER.indexOf(a)
  const bIndex = PLAN_ORDER.indexOf(b)
  return aIndex - bIndex
}

export function isAtLeast(plan: SubscriptionPlan, minPlan: SubscriptionPlan): boolean {
  return comparePlans(plan, minPlan) >= 0
}

export function limitFor(plan: SubscriptionPlan, key: string): number {
  return PLAN_CONFIG[plan]?.limits[key] ?? 0
}

export function hasFeature(plan: SubscriptionPlan, feature: string): boolean {
  return PLAN_CONFIG[plan]?.features[feature] ?? false
}

export function getEntitlements(plan: SubscriptionPlan) {
  return PLAN_CONFIG[plan] ?? PLAN_CONFIG[DEFAULT_PLAN]
}

// Re-export types from existing stripe types
export type { SubscriptionPlan as StripeSubscriptionPlan } from './types/stripe'
