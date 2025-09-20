<script setup lang="ts">
import { signupSchema, type SignupSchema } from '#shared/schemas/auth'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth',
  title: 'Sign up'
})

useSeoMeta({
  title: 'Sign up',
  description: 'Create an account to get started'
})

const toast = useToast()
const { signup, error } = useAuth()

const fields = [{
  name: 'username',
  type: 'text' as const,
  label: 'Username',
  placeholder: 'Enter your username',
  required: true
}, {
  name: 'email',
  type: 'email' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'firstName',
  type: 'text' as const,
  label: 'First Name',
  placeholder: 'Enter your first name'
}, {
  name: 'lastName',
  type: 'text' as const,
  label: 'Last Name',
  placeholder: 'Enter your last name'
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password',
  required: true
}, {
  name: 'confirmPassword',
  label: 'Confirm Password',
  type: 'password' as const,
  placeholder: 'Confirm your password',
  required: true
}, {
  name: 'acceptTerms',
  label: 'I agree to the Terms of Service',
  type: 'checkbox' as const,
  required: true
}]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  provider: 'google',
  onClick: () => {
    toast.add({ title: 'Google', description: 'Sign up with Google' })
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  provider: 'github',
  onClick: () => {
    toast.add({ title: 'GitHub', description: 'Sign up with GitHub' })
  }
}]

type Schema = SignupSchema

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload)

  const res = await signup(payload.data)
  console.log('res', res)
  if (res) {
    // redirect where you want
    navigateTo('/dashboard/protected')
  }
}
</script>

<template>
  <UAuthForm :fields="fields" :schema="signupSchema" :providers="providers" title="Create an account"
    :submit="{ label: 'Create account' }" @submit="onSubmit">
    <template #description>
      Already have an account? <ULink to="/login" class="text-primary font-medium">Login</ULink>.
    </template>
    <template #validation>
      <UAlert v-if="error" variant="subtle" color="error" icon="i-lucide-info" :title="error" />
    </template>
    <template #footer>
      By signing up, you agree to our <ULink to="/" class="text-primary font-medium">Terms of Service</ULink>.
    </template>


  </UAuthForm>
</template>
