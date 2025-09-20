<script setup lang="ts">
const { data: page } = await useAsyncData('terms-of-service', () => queryCollection('terms_of_service').first())

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
        <div class="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div class="flex items-center space-x-2 text-sm text-amber-700 dark:text-amber-300">
            <UIcon name="i-lucide-alert-triangle" class="w-4 h-4" />
            <span>
              Last updated: {{ page.last_updated }} |
              Effective date: {{ page.effective_date }}
            </span>
          </div>
        </div>

        <!-- Terms Sections -->
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

        <!-- Important Notice -->
        <div class="mt-12 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div class="flex items-start space-x-3">
            <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 class="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Important Notice
              </h3>
              <p class="text-red-700 dark:text-red-300 text-sm">
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these
                Terms of Service.
                If you do not agree to these terms, please do not use our services.
              </p>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Questions About These Terms?
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            If you have any questions about these Terms of Service or need clarification on any provision, please
            contact our legal team.
          </p>
          <div class="flex flex-wrap gap-4">
            <UButton to="/contact" icon="i-lucide-mail" variant="outline">
              Contact Us
            </UButton>
            <UButton to="mailto:legal@company.com" icon="i-lucide-external-link" variant="ghost" target="_blank">
              Email Legal Team
            </UButton>
          </div>
        </div>
      </div>
    </UPageSection>
  </div>
</template>
