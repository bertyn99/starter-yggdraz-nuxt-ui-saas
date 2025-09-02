import { computed } from 'vue'
import { DEFAULT_PLAN, getEntitlements, isAtLeast as planAtLeast, limitFor as planLimitFor, hasFeature as planHasFeature, generateStripeLookupKey, type SubscriptionPlan, PLAN_CONFIG } from '../plans'

export function useSubscription() {
  const items = ref([
    {
      label: 'Monthly',
      value: '0'
    },
    {
      label: 'Yearly',
      value: '1'
    }
  ])
  const loading = ref(false)
  const isYearly = ref('0')

  const { loggedIn, session, user, fetch } = useUserSession()

  const plan = computed<SubscriptionPlan>(() => (session.value?.subscription?.plan as SubscriptionPlan) || DEFAULT_PLAN)
  const isSubscribed = computed<boolean>(() => Boolean(session.value?.subscription?.isActive))
  const entitlements = computed(() => getEntitlements(plan.value))

  function isAtLeast(minPlan: SubscriptionPlan) {
    return planAtLeast(plan.value, minPlan)
  }

  function hasFeature(key: string) {
    return planHasFeature(plan.value, key)
  }

  function limitFor(key: string) {
    return planLimitFor(plan.value, key)
  }

  const checkout = async (lookupKey: string) => {
    // Generate the Stripe lookup key programmatically
    const billingCycle = isYearly.value === '1' ? 'yearly' : 'monthly'
    const stripeLookupKey = generateStripeLookupKey(lookupKey, billingCycle)
    console.log('Generated Stripe lookup key:', stripeLookupKey)
    loading.value = true
    const res = await useRequestFetch()('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: {
        lookup_key: stripeLookupKey
      }
    })

    loading.value = false
    if (res) {
      await navigateTo(res.url, {
        external: true
      })
    }
  }
  const navigateToStripeDashboard = async () => {
    loading.value = true
    const res = await useRequestFetch()('/api/stripe/create-customer-portal-session', {
      method: 'POST'
    })

    loading.value = false
    if (res && typeof res === 'object' && 'url' in res) {
      await navigateTo(res.url as string, {
        external: true
      })
    } else {
      console.error('Error creating portal session:', res)
    }
  }

  const getCurrentSubscription = async () => {
    loading.value = true
    const res = await useRequestFetch()('/api/stripe/subscription')

    loading.value = false
    return res
  }

  const plans = computed(() => {
    const getText = () => {
      if (isSubscribed.value) return 'Manage Subscription'
      else if (user.value) return 'Buy Now'
      else return 'Sign In to Buy'
    }

    return PLAN_CONFIG.map((tier) => {
      const updatedTier = {
        ...tier,
        button: {
          ...tier.button,
          label: tier.button.onClick
            ? getText()
            : tier.button.label
        }
      }

      // Conditionally add onClick only if it doesn't already exist in the tier
      if (tier.button.onClick) {
        updatedTier.button.onClick = isSubscribed.value
          ? async () => navigateTo('/dashboard')
          : async () => await checkout(tier.id)
      }

      return updatedTier
    })
  })

  return {
    // state
    isAuthenticated: loggedIn,
    isSubscribed,
    plan,
    entitlements,
    isYearly,
    items,
    loading,
    plans,
    // helpers
    isAtLeast,
    hasFeature,
    limitFor,
    // session
    fetch,
    checkout,
    navigateToStripeDashboard,
    getCurrentSubscription
  }
}
