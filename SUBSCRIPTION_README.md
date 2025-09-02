# Subscription & Entitlements System

This system provides a single source of truth for subscription state, feature gating, and limit enforcement across your Nuxt application.

## Quick Start

### 1. Check subscription status with `<AuthState>`

```vue
<AuthState v-slot="{ loggedIn, session }">
  <PremiumSection v-if="loggedIn && session?.subscription?.isActive" />
  <UpgradeCTA v-else />
</AuthState>
```

### 2. Gate features by plan with `<FeatureGate>`

```vue
<FeatureGate minPlan="pro">
  <TeamBillingSettings />
</FeatureGate>

<FeatureGate featureKey="teamCollaboration">
  <TeamDashboard />
</FeatureGate>
```

### 3. Use the composable for programmatic checks

```ts
const { isSubscribed, plan, hasFeature, limitFor, isAtLeast } = useSubscription()

if (!isSubscribed.value || !isAtLeast('pro')) {
  navigateTo('/upgrade')
}

const maxProjects = limitFor('projects')
```

### 4. Enforce limits on the server

```ts
// server/api/projects/create.post.ts
export default defineEventHandler(async (event) => {
  await requirePlan(event, { atLeast: 'plus' })
  await checkLimit(event, {
    key: 'projects',
    getCurrentUsage: async () => countProjectsForUser(event)
  })
  // proceed to create project
})
```

## Architecture

### Single Source of Truth

- **Database**: `subscriptions` table with one row per user
- **Shared Config**: `shared/plans.ts` defines all plans, features, and limits
- **Session**: Subscription data is automatically loaded into `useUserSession()`

### Plan Configuration

Edit `shared/plans.ts` to define your plans:

```ts
export const PLAN_CONFIG = {
  free: {
    features: { apiAccess: false, teamCollaboration: false },
    limits: { projects: 3, teamMembers: 1 }
  },
  plus: {
    features: { apiAccess: true, teamCollaboration: false },
    limits: { projects: 10, teamMembers: 3 }
  },
  // ... more plans
}
```

### Stripe Integration

The system automatically maps Stripe `price.lookup_key` to internal plan names:

```ts
export const STRIPE_LOOKUP_TO_PLAN = {
  'plus': 'plus',
  'pro': 'pro',
  'enterprise': 'enterprise'
}
```

## API Reference

### `useSubscription()` Composable

```ts
const {
  // State
  isSubscribed,    // boolean - is subscription active
  plan,           // string - current plan name
  entitlements,   // object - features and limits
  subscription,   // object - full subscription data
  isLoading,      // boolean - session loading state
  isAuthenticated, // boolean - user authentication state
  
  // Helpers
  isAtLeast(minPlan),     // boolean - plan comparison
  hasFeature(feature),     // boolean - feature check
  limitFor(key),          // number - get limit value
  isUnlimited(key),       // boolean - is limit unlimited
  checkLimit(key, usage), // boolean - check if within limit
  getRemainingLimit(key, usage) // number - remaining limit
} = useSubscription()
```

### `<FeatureGate>` Component

```vue
<FeatureGate 
  minPlan="pro"           // require minimum plan
  featureKey="sso"        // require specific feature
  invert={false}         // invert the condition
>
  <slot />
</FeatureGate>
```

### Server Helpers

```ts
// Require plan level or feature
await requirePlan(event, { 
  atLeast: 'pro' | 'plus' | 'enterprise',
  exact: 'pro',
  feature: 'sso'
})

// Check usage limits
await checkLimit(event, {
  key: 'projects',
  getCurrentUsage: async () => countProjects(),
  errorMessage: 'Custom error message'
})
```

## Migration Notes

1. **Plan Names**: Replace any hardcoded `'student'` with valid plans (`'plus' | 'pro' | 'enterprise'`)
2. **Database**: Existing users without subscription rows will default to `'free'` plan
3. **Session**: Subscription data is automatically loaded on session fetch

## Testing

Visit `/example-subscription` to see all features in action:

- AuthState gating
- FeatureGate components
- Composable usage
- Plan comparison
- Feature checks
- Limit display

## Files Created

- `shared/plans.ts` - Plan configuration and utilities
- `server/utils/subscription.ts` - Server subscription helpers
- `server/utils/entitlements.ts` - Server enforcement helpers
- `composables/useSubscription.ts` - Client composable
- `components/FeatureGate.vue` - Feature gating component
- `pages/example-subscription.vue` - Demo page
- `server/api/example/projects/create.post.ts` - Example API endpoint

## Updated Files

- `server/plugins/session.ts` - Added subscription to session
- `server/utils/stripeHooks.ts` - Updated to use plan mapping
