<!-- pages/example-subscription.vue -->
<template>
  <UContainer>
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-6">
        Subscription Example
      </h1>

      <!-- Using AuthState for simple gating -->
      <AuthState v-slot="{ loggedIn, session }">
        <div
          v-if="loggedIn && session?.subscription?.isActive"
          class="mb-6"
        >
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">
                Premium Dashboard
              </h3>
            </template>
            <p>Welcome to your premium dashboard!</p>
            <p class="text-sm text-gray-600 mt-2">
              Plan: {{ session.subscription.plan }}
            </p>
          </UCard>
        </div>
        <div
          v-else
          class="mb-6"
        >
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">
                Upgrade Required
              </h3>
            </template>
            <p>Please upgrade your plan to access premium features.</p>
            <UButton
              to="/pricing"
              class="mt-2"
            >
              View Plans
            </UButton>
          </UCard>
        </div>
      </AuthState>

      <!-- Using FeatureGate component -->
      <div class="space-y-4">
        <FeatureGate min-plan="plus">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">
                Plus Features
              </h3>
            </template>
            <p>This content is only visible to Plus plan users and above.</p>
          </UCard>
        </FeatureGate>

        <FeatureGate min-plan="pro">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">
                Pro Features
              </h3>
            </template>
            <p>This content is only visible to Pro plan users and above.</p>
          </UCard>
        </FeatureGate>

        <FeatureGate feature-key="teamCollaboration">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">
                Team Collaboration
              </h3>
            </template>
            <p>Team collaboration features are enabled.</p>
          </UCard>
        </FeatureGate>
      </div>

      <!-- Using the composable directly -->
      <div class="mt-8">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">
              Subscription Details
            </h3>
          </template>

          <div
            v-if="isLoading"
            class="text-center py-4"
          >
            <UIcon
              name="i-heroicons-arrow-path"
              class="animate-spin"
            />
            Loading...
          </div>

          <div
            v-else-if="isAuthenticated"
            class="space-y-4"
          >
            <div>
              <strong>Plan:</strong> {{ plan }}
            </div>
            <div>
              <strong>Is Subscribed:</strong> {{ isSubscribed ? 'Yes' : 'No' }}
            </div>
            <div>
              <strong>Can access API:</strong> {{ hasFeature('apiAccess') ? 'Yes' : 'No' }}
            </div>
            <div>
              <strong>Project limit:</strong> {{ limitFor('projects') === -1 ? 'Unlimited' : limitFor('projects') }}
            </div>

            <div
              v-if="isAtLeast('pro')"
              class="mt-4 p-3 bg-green-50 rounded"
            >
              <p class="text-green-800">
                You have access to Pro features!
              </p>
            </div>
          </div>

          <div
            v-else
            class="text-center py-4"
          >
            <p>Please log in to view subscription details.</p>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const { isSubscribed, plan, entitlements, isLoading, isAuthenticated, hasFeature, limitFor, isAtLeast } = useSubscription()

// Set page title
useHead({
  title: 'Subscription Example'
})
</script>
