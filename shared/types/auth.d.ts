// Field configuration types for forms

// OAuth provider types
export type OAuthProvider = 'google' | 'facebook' | 'apple' | 'twitter' | 'github'

// OAuth provider configuration
export type OAuthProviderConfig = {
  label: string
  icon: string
  provider: OAuthProvider
  onClick: () => void | Promise<void>
  disabled?: boolean
  loading?: boolean
}

// User roles and permissions
export type UserRole = 'user' | 'admin' | 'staff'
export type Permission = 'read' | 'write' | 'delete' | 'admin'

// User profile information
export interface UserProfile {
  id: string
  username: string
  email: string
  firstName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  role: UserRole
  emailVerified: boolean
  avatar?: string | null
  bio?: string | null
  createdAt: Date
  updatedAt: Date
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserProfile | null
  session: UserSession | null
  error: string | null
}

// Session management
export interface UserSession {
  id: string
  userId: string
  token: string
  userAgent?: string | null
  ipAddress?: string | null
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

// Login form data
export interface LoginFormData {
  email: string
  password: string
  remember?: boolean
}

// Signup form data
export interface SignupFormData {
  email: string
  username: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
  acceptTerms?: boolean
  acceptMarketing?: boolean
}

// Password reset form data
export interface PasswordResetFormData {
  email: string
}

// Password change form data
export interface PasswordChangeFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Profile update form data
export interface ProfileUpdateFormData {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  bio?: string
  avatar?: File | null
}

// API response types
export interface AuthResponse {
  success: boolean
  message?: string
  user?: UserProfile
  token?: string
  expiresAt?: Date
}

export interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: Record<string, unknown>
}

// Validation error types
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ValidationErrors {
  [key: string]: ValidationError[]
}

// User session composable interface
export interface UserSessionComposable {
  loggedIn: ComputedRef<boolean>
  user: ComputedRef<UserProfile | null>
  session: Ref<UserSession | null>
  authState: ComputedRef<AuthState>
  login: (credentials: LoginFormData) => Promise<AuthResponse>
  signup: (data: SignupFormData) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  updateProfile: (data: ProfileUpdateFormData) => Promise<AuthResponse>
  changePassword: (data: PasswordChangeFormData) => Promise<AuthResponse>
  resetPassword: (data: PasswordResetFormData) => Promise<AuthResponse>
  fetch: () => Promise<void>
  clear: () => Promise<void>
}

// Auth utilities module augmentation
declare module '#auth-utils' {
  interface User extends UserProfile {
    // Additional properties can be added here if needed
  }

  interface UserSession {
    user: {
      id: string
      username: string
      email: string
      role: UserRole
    }
  }

  interface SecureSessionData {
    userId: string
    role: UserRole
    permissions?: Permission[]
    lastActivity: Date
  }
}

// Export all types
export type {

}
