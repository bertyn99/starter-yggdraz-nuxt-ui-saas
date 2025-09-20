<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
const route = useRoute()

const items = computed(() => [
  /*  {
  label: 'Docs',
  to: '/docs',
  active: route.path.startsWith('/docs')
}, */
  {
    label: 'Pricing',
    to: '/pricing'
  }, {
    label: 'FAQ',
    to: '/faq'
  }, {
    label: 'Blog',
    to: '/blog'
  }, {
    label: 'Changelog',
    to: '/changelog',
    badge: {
      label: 'New',
      color: 'primary' as const
    }
  }])

const userMenuItems = ref<DropdownMenuItem[][]>([
  [
    {
      label: 'Acme User',
      avatar: {
        src: 'https://github.com/benjamincanac.png'
      },
      type: 'label'
    }
  ],
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user'
    },
    {
      label: 'Billing',
      icon: 'i-lucide-credit-card'
    },
    {
      label: 'Settings',
      icon: 'i-lucide-cog',
      kbds: [',']
    },
    {
      label: 'Keyboard shortcuts',
      icon: 'i-lucide-monitor'
    }
  ],
  [
    {
      label: 'Team',
      icon: 'i-lucide-users'
    },
    {
      label: 'Invite users',
      icon: 'i-lucide-user-plus',
      children: [
        [
          {
            label: 'Email',
            icon: 'i-lucide-mail'
          },
          {
            label: 'Message',
            icon: 'i-lucide-message-square'
          }
        ],
        [
          {
            label: 'More',
            icon: 'i-lucide-circle-plus'
          }
        ]
      ]
    },
  ],
  [

    {
      label: 'Support',
      icon: 'i-lucide-life-buoy',
      to: '/components/dropdown-menu'
    },
    {
      label: 'API',
      icon: 'i-lucide-cloud',
      disabled: true
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      kbds: ['shift', 'meta', 'q']
    }
  ]
])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-1 hover:opacity-80 transition-opacity">
        <svg width="32" height="28" viewBox="0 0 46 40" class="w-6 h-8 text-primary dark:text-primary" fill="none"
          xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M0 33L4.60606 25H12.2448C17.2569 25 21.4947 28.7103 22.1571 33.6784L23 40H13L11.5585 36.6365C10.613 34.4304 8.44379 33 6.04362 33H0Z"
            fill="currentColor"></path>
          <path
            d="M46 33L41.3939 25H33.7552C28.7431 25 24.5053 28.7103 23.8429 33.6784L23 40H33L34.4415 36.6365C35.387 34.4304 37.5562 33 39.9564 33H46Z"
            fill="currentColor"></path>
          <path d="M4.60606 25L18.9999 0H23L22.6032 9.52405C22.2608 17.7406 15.7455 24.3596 7.53537 24.8316L4.60606 25Z"
            fill="currentColor"></path>
          <path d="M41.3939 25L27.0001 0H23L23.3968 9.52405C23.7392 17.7406 30.2545 24.3596 38.4646 24.8316L41.3939 25Z"
            fill="currentColor"></path>
        </svg>
        <span class="text-xl font-semibold text-gray-900 dark:text-white">cme</span>
      </NuxtLink>
      <TemplateMenu />
    </template>

    <UNavigationMenu :items="items" variant="link" />

    <template #right>
      <UColorModeButton />

      <AuthState v-slot="{ loggedIn, clear, user }">
        {{ loggedIn }}
        <template v-if="!loggedIn">
          <UButton icon="i-lucide-log-in" color="neutral" variant="ghost" to="/login" class="lg:hidden" />

          <UButton label="Sign in" color="neutral" variant="outline" to="/login" class="hidden lg:inline-flex" />

          <UButton label="Sign up" color="neutral" trailing-icon="i-lucide-arrow-right" class="hidden lg:inline-flex"
            to="/signup" />
        </template>
        <template v-else>
          <UDropdownMenu :items="userMenuItems" :ui="{
            content: 'w-48'
          }">
            <UButton :avatar="{
              src: '',
              alt: user?.username,
              size: 'md',
            }" variant="ghost" class="rounded-full " />
          </UDropdownMenu>
        </template>
      </AuthState>

    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />

      <USeparator class="my-6" />
      <AuthState v-slot="{ loggedIn, clear, user }">
        {{ loggedIn }}
        <template v-if="!loggedIn">
          <UButton label="Sign in" color="neutral" variant="subtle" to="/login" block class="mb-3" />
          <UButton label="Sign up" color="neutral" to="/signup" block />
        </template>
        <template v-else>
          <UDropdownMenu :items="userMenuItems" :ui="{
            content: 'w-48'
          }">
            <UButton :avatar="{
              src: '',
              alt: user?.username,
              size: 'md',
            }" variant="ghost" class="rounded-full " />
          </UDropdownMenu>
        </template>
      </AuthState>
    </template>
  </UHeader>
</template>
