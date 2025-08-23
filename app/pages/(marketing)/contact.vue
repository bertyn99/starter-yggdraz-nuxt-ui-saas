<script setup lang="ts">
const { data: page } = await useAsyncData('contact', () => queryCollection('contact').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const form = ref({
  name: '',
  email: '',
  company: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const submitSuccess = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  
  // Simulate form submission
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  isSubmitting.value = false
  submitSuccess.value = true
  
  // Reset form
  form.value = {
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  }
  
  // Hide success message after 5 seconds
  setTimeout(() => {
    submitSuccess.value = false
  }, 5000)
}
</script>

<template>
  <div v-if="page">
    <UPageHero
      :title="page.hero.title"
      :description="page.hero.description"
      :links="page.hero.links"
    />

    <UPageSection>
      <UPageGrid>
        <!-- Contact Information -->
        <div class="col-span-full lg:col-span-1/2">
          <div class="space-y-8">
            <!-- Contact Methods -->
            <div>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {{ page.contact_info.title }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                {{ page.contact_info.description }}
              </p>
              
              <div class="space-y-4">
                <div
                  v-for="method in page.contact_info.methods"
                  :key="method.title"
                  class="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div class="flex-shrink-0">
                    <UIcon
                      :name="method.icon"
                      class="w-6 h-6 text-primary-500"
                    />
                  </div>
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900 dark:text-white">
                      {{ method.title }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {{ method.description }}
                    </p>
                    <p class="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {{ method.contact }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-500">
                      {{ method.response_time }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Office Locations -->
            <div>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {{ page.office_locations.title }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                {{ page.office_locations.description }}
              </p>
              
              <div class="space-y-4">
                <div
                  v-for="location in page.office_locations.locations"
                  :key="location.city"
                  class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <h3 class="font-medium text-gray-900 dark:text-white mb-2">
                    {{ location.city }}, {{ location.country }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {{ location.address }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {{ location.phone }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-500">
                    {{ location.hours }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Social Media -->
            <div>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {{ page.social_media.title }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                {{ page.social_media.description }}
              </p>
              
              <div class="flex space-x-4">
                <UButton
                  v-for="platform in page.social_media.platforms"
                  :key="platform.name"
                  :to="platform.url"
                  target="_blank"
                  variant="ghost"
                  :icon="platform.icon"
                  class="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="col-span-full lg:col-span-1/2">
          <div class="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Send us a message
            </h2>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UFormGroup label="Name" required>
                  <UInput
                    v-model="form.name"
                    placeholder="Your name"
                    required
                  />
                </UFormGroup>

                <UFormGroup label="Email" required>
                  <UInput
                    v-model="form.email"
                    type="email"
                    placeholder="your.email@company.com"
                    required
                  />
                </UFormGroup>
              </div>

              <UFormGroup label="Company">
                <UInput
                  v-model="form.company"
                  placeholder="Your company (optional)"
                />
              </UFormGroup>

              <UFormGroup label="Subject" required>
                <USelect
                  v-model="form.subject"
                  :options="[
                    'General Inquiry',
                    'Technical Support',
                    'Sales Question',
                    'Partnership',
                    'Feature Request',
                    'Other'
                  ]"
                  placeholder="Select a subject"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Message" required>
                <UTextarea
                  v-model="form.message"
                  placeholder="Tell us how we can help you..."
                  rows="5"
                  required
                />
              </UFormGroup>

              <UButton
                type="submit"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="w-full"
                size="lg"
              >
                {{ isSubmitting ? 'Sending...' : 'Send Message' }}
              </UButton>
            </form>

            <!-- Success Message -->
            <UAlert
              v-if="submitSuccess"
              title="Message sent successfully!"
              description="We'll get back to you as soon as possible."
              color="green"
              variant="soft"
              class="mt-4"
            />
          </div>
        </div>
      </UPageGrid>
    </UPageSection>

    <!-- FAQ Preview -->
    <UPageSection>
      <div class="text-center">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ page.faq_preview.title }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ page.faq_preview.description }}
        </p>
        <UButton
          :to="page.faq_preview.link.to"
          :icon="page.faq_preview.link.icon"
          :trailing="page.faq_preview.link.trailing"
          variant="outline"
        >
          {{ page.faq_preview.link.label }}
        </UButton>
      </div>
    </UPageSection>
  </div>
</template>
