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

// Auth utilities module augmentation
declare module '#auth-utils' {
  interface User {
    id: string
    username: string
    email: string
    // Additional properties can be added here if needed
  }

  interface UserSession {
    sessionId: string
    sessionMetadata?: {
      ipAddress?: string
      userAgent?: string
    }
    subscription?: SubscriptionWithEntitlements
  }

  interface SecureSessionData {
    userId: string

    permissions?: Permission[]
    lastActivity: Date
  }
}

// Export all types
export type {

}
