<script setup lang="ts">
const { data: page } = await useAsyncData('faq', () => queryCollection('faq').first())

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
      <UPageGrid>
        <div v-for="(section, sectionIndex) in page.sections" :key="sectionIndex" class="col-span-full">
          <div class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {{ section.title }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              {{ section.description }}
            </p>
          </div>

          <UAccordion :items="section.items.map((item, itemIndex) => ({
            label: item.question,
            content: item.answer,
            defaultOpen: itemIndex === 0
          }))" :ui="{
            wrapper: 'space-y-4',
            item: {
              base: 'border border-gray-200 dark:border-gray-800 rounded-lg',
              padding: 'p-4',
              background: 'bg-white dark:bg-gray-900',
              ring: 'focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
              shadow: 'shadow-sm'
            },
            trigger: {
              base: 'flex w-full items-center justify-between text-left',
              padding: 'py-2',
              font: 'font-medium',
              color: 'text-gray-900 dark:text-white',
              hover: 'hover:text-primary-500 dark:hover:text-primary-400',
              icon: 'flex-shrink-0 h-5 w-5'
            },
            content: {
              base: 'overflow-hidden transition-all duration-200',
              padding: 'pt-2 pb-1',
              color: 'text-gray-600 dark:text-gray-400',
              size: 'text-sm'
            }
          }" />
        </div>
      </UPageGrid>
    </UPageSection>

    <USeparator />

    <UPageCTA title="Still have questions?"
      description="Can't find the answer you're looking for? Please chat to our friendly team." :links="[
        {
          label: 'Contact Support',
          to: '/contact',
          icon: 'i-lucide-message-circle',
          variant: 'solid'
        }
      ]" />
  </div>
</template>
