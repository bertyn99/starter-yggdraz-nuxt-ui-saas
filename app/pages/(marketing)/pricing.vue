<script setup lang="ts">
const { data: page } = await useAsyncData('pricing', () => queryCollection('pricing').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description
const { isYearly, items, plans } = useSubscription()

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

definePageMeta({
  title
})

defineOgImageComponent('Saas')

const isYearly = ref('0')

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

// Pricing schema: Product/Offer style summary
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: new URL('/pricing', ((import.meta as any).env?.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000')).toString(),
        mainEntity: {
          '@type': 'ItemList',
          name: 'Pricing Plans',
          itemListElement: (page.value?.plans || []).map((plan: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              name: plan.title,
              description: plan.description,
              offers: [
                plan.price?.month && {
                  '@type': 'Offer',
                  priceCurrency: plan.price?.currency || 'USD',
                  price: String(plan.price.month),

                  availability: 'https://schema.org/InStock'
                },
                plan.price?.year && {
                  '@type': 'Offer',
                  priceCurrency: plan.price?.currency || 'USD',
                  price: String(plan.price.year),
                  availability: 'https://schema.org/InStock'
                }
              ].filter(Boolean)
            }
          }))
        }
      })
    }
  ]
})
</script>

<template>
  <div v-if="page">
    <UPageHero :title="page.title" :description="page.description">
      <template #links>
        <UTabs v-model="isYearly" :items="items" color="neutral" size="xs" class="w-48" :ui="{
          list: 'ring ring-accented rounded-full',
          indicator: 'rounded-full',
          trigger: 'w-1/2'
        }" />
      </template>
    </UPageHero>

    <UContainer>
      <UPricingPlans scale>
        <UPricingPlan v-for="(plan, index) in page.plans" :key="index" v-bind="plan"
          :price="isYearly === '1' ? plan.price.yearly : plan.price.monthly"
          :billing-cycle="isYearly === '1' ? '/year' : '/month'" :button="plan.button" />
      </UPricingPlans>
    </UContainer>

    <UPageSection>
      <UPageLogos>
        <UIcon v-for="icon in page.logos.icons" :key="icon" :name="icon" class="w-12 h-12 flex-shrink-0 text-muted" />
      </UPageLogos>
    </UPageSection>

    <UPageSection :title="page.faq.title" :description="page.faq.description">
      <UPageAccordion :items="page.faq.items" multiple class="max-w-4xl mx-auto" />
    </UPageSection>
  </div>
</template>
