<script setup lang="ts">
import { loginSchema, type LoginSchema } from '#shared/schemas/auth'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue'
})

const toast = useToast()
const { login, error } = useAuth()

const fields = [{
  name: 'email',
  type: 'email' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password',
  required: true
}, {
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox' as const
}]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  provider: 'google',
  onClick: () => {
    toast.add({ title: 'Google', description: 'Login with Google' })
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  provider: 'github',
  onClick: () => {
    toast.add({ title: 'GitHub', description: 'Login with GitHub' })
  }
}]

type Schema = LoginSchema

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload)
  const res = await login(payload.data)

  if (res) {
    // redirect where you want
    navigateTo('/')
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="loginSchema"
    :providers="providers"
    title="Welcome back"
    icon="i-lucide-lock"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account? <ULink
        to="/register"
        class="text-primary font-medium"
      >Sign up</ULink>.
    </template>

    <template #password-hint>
      <ULink
        to="/forgot-password"
        class="text-primary font-medium"
        tabindex="-1"
      >Forgot password?</ULink>
    </template>

    <template #footer>
      By signing in, you agree to our <ULink
        to="/"
        class="text-primary font-medium"
      >Terms of Service</ULink>.
    </template>
    <template #validation>
      <UAlert
        v-if="error"
        variant="subtle"
        color="error"
        icon="i-lucide-info"
        :title="error.message"
      />
    </template>
  </UAuthForm>
</template>
