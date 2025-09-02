<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <UCard class="max-w-md w-full p-6 space-y-6">
            <div class="text-center">
                <UIcon name="i-heroicons-x-circle" class="mx-auto h-16 w-16 text-red-500" />
                <h2 class="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                    Subscription Cancelled
                </h2>
                <p class="mt-2 text-gray-600 dark:text-gray-300">
                    Your subscription process was cancelled. If this was a mistake, you can retry the subscription.
                </p>
            </div>

            <div class="space-y-4">
                <UButton to="/pricing" block color="primary" variant="solid">
                    Return to Pricing
                </UButton>
                <UButton to="/contact" block color="gray" variant="soft">
                    Contact Support
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
</script>