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
      label: 'Benjamin',
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
      <NuxtLink to="/">
        <LogoPro class="w-auto h-6 shrink-0" />
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
