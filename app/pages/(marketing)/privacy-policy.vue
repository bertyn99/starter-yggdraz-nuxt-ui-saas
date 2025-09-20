<script setup lang="ts">
const { data: page } = await useAsyncData('privacy-policy', () => queryCollection('privacy_policy').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

definePageMeta({
  title
})
</script>

<template>
  <div v-if="page">
    <UPageHero :title="page.title" :description="page.description" />

    <UPageSection>
      <div class="max-w-4xl mx-auto">
        <!-- Last Updated Info -->
        <div class="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div class="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
            <UIcon name="i-lucide-info" class="w-4 h-4" />
            <span>
              Last updated: {{ page.last_updated }} |
              Effective date: {{ page.effective_date }}
            </span>
          </div>
        </div>

        <!-- Policy Sections -->
        <div class="space-y-8">
          <div v-for="(section, index) in page.sections" :key="index">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {{ section.title }}
            </h2>

            <!-- Use ContentRenderer with prose styling -->
            <div class="prose prose-gray dark:prose-invert max-w-none">
              <ContentRenderer :value="{ body: { content: section.content } }" />
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Questions About This Policy?
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            If you have any questions about this Privacy Policy or our data practices, please don't hesitate to contact
            us.
          </p>
          <div class="flex flex-wrap gap-4">
            <UButton to="/contact" icon="i-lucide-mail" variant="outline">
              Contact Us
            </UButton>
            <UButton to="mailto:privacy@company.com" icon="i-lucide-external-link" variant="ghost" target="_blank">
              Email Privacy Team
            </UButton>
          </div>
        </div>
      </div>
    </UPageSection>
  </div>
</template>
