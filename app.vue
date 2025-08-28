<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">


useSeoMeta({
  title: site.name,
  ogTitle: site.name,
  description: site.description,
  ogDescription: site.description,
  ogType: 'website',
  ogSiteName: site.name,
  twitterCard: 'summary_large_image'
})
</script>
