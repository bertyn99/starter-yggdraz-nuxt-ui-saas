<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <UCard class="max-w-md w-full p-6 space-y-6">
            <div class="text-center">
                <UIcon name="i-heroicons-check-circle" class="mx-auto h-16 w-16 text-green-500" />
                <h2 class="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                    Subscription Successful
                </h2>
                <p class="mt-2 text-gray-600 dark:text-gray-300">
                    Thank you for subscribing! You now have access to all premium features.
                </p>
            </div>

            <div class="space-y-4">
                <UButton to="/dashboard" block color="primary" variant="solid">
                    Go to Dashboard
                </UButton>
                <UButton to="/pricing" block color="gray" variant="soft">
                    View Subscription Details
                </UButton>
            </div>
        </UCard>
    </div>
</template>

<script setup>
definePageMeta({
    middleware: ['auth'], // Ensure only authenticated users can access
    layout: 'default',
})

const { fetch } = useUserSession()

onMounted(async () => {
    await fetch()
})
/*
// Optional: Add logic to verify Stripe session
const { $stripe } = useNuxtApp()
 
onMounted(async () => {
  try {
    // Verify the Stripe session or log the successful subscription
    const sessionId = useRoute().query.session_id
    if (sessionId) {
      // You might want to call a server endpoint to confirm and log the subscription
      await $fetch('/api/stripe/confirm-subscription', {
        method: 'POST',
        body: { sessionId },
      })
    }
  }
  catch (error) {
    console.error('Subscription confirmation error:', error)
  }
}) */
</script>