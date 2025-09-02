<!-- components/FeatureGate.vue -->
<template>
  <div v-if="shouldRender">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { SubscriptionPlan } from '~/shared/plans'

interface Props {
  minPlan?: SubscriptionPlan
  featureKey?: string
  invert?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  minPlan: undefined,
  featureKey: undefined,
  invert: false
})

const { isAtLeast, hasFeature, isSubscribed } = useSubscription()

const shouldRender = computed(() => {
  let result = true

  // Check minimum plan requirement
  if (props.minPlan) {
    result = result && isAtLeast(props.minPlan)
  }

  // Check specific feature requirement
  if (props.featureKey) {
    result = result && hasFeature(props.featureKey)
  }

  // Invert the result if requested
  if (props.invert) {
    result = !result
  }

  return result
})
</script>
