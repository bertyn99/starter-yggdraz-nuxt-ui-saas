import { z } from 'zod'

// Base validation schemas
export const emailSchema = z
  .email('Invalid email format')
  .min(1, 'Email is required')
  .toLowerCase()
  .trim()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export type LoginSchema = z.infer<typeof loginSchema>

// Signup schema
export const signupSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional()
})

export type SignupSchema = z.infer<typeof signupSchema>

// Password reset schema
export const passwordResetSchema = z.object({
  email: emailSchema
})

export type PasswordResetSchema = z.infer<typeof passwordResetSchema>

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword']
})

export type PasswordChangeSchema = z.infer<typeof passwordChangeSchema>

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional()
    .nullable()
})

export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>

// Validation helpers
export const validateEmail = (email: string) => emailSchema.safeParse(email)
export const validatePassword = (password: string) => passwordSchema.safeParse(password)
export const validateUsername = (username: string) => usernameSchema.safeParse(username)

// Error message helpers
export const getValidationError = (error: z.ZodError) => {
  const firstError = error.errors[0]
  return firstError ? firstError.message : 'Validation failed'
}
