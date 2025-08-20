# Shared Schema & Types

This directory contains shared schemas and types used across the application for consistent validation and type safety.

## Structure

```
shared/
├── schema/
│   ├── auth.ts          # Zod validation schemas for authentication
│   └── index.ts         # Main export file for all schemas
├── types/
│   ├── auth.d.ts        # Authentication-related TypeScript types
│   └── database.ts      # Database types inferred from Drizzle schema
└── README.md            # This file
```

## Usage

### Importing Schemas

```typescript
// Import specific schemas
import { loginSchema, signupSchema } from '~/shared/schemas/auth'

// Import all schemas
import * as schemas from '~/shared/schema'
```

### Importing Types

```typescript
// Import specific types
import type { UserProfile, LoginFormData } from '~/shared/types/auth'
import type { User, Account } from '~/shared/types/database'

// Import all types
import type * as types from '~/shared/types'
```

### Using Schemas for Validation

```typescript
// Frontend form validation
const formData = { email: 'user@example.com', password: 'password123' }
const result = loginSchema.safeParse(formData)

if (result.success) {
  // Data is valid
  const { email, password } = result.data
} else {
  // Handle validation errors
  console.log(result.error.issues)
}

// Backend API validation
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validationResult = loginSchema.safeParse(body)
  
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${validationResult.error.issues[0]?.message}`
    })
  }
  
  const { email, password } = validationResult.data
  // Process validated data...
})
```

## Available Schemas

### Authentication Schemas

- `loginSchema` - Login form validation
- `signupSchema` - Signup form validation
- `passwordResetSchema` - Password reset request
- `passwordChangeSchema` - Password change with confirmation
- `profileUpdateSchema` - Profile update validation

### Base Validation Schemas

- `emailSchema` - Email validation with formatting
- `passwordSchema` - Strong password requirements
- `usernameSchema` - Username format validation
- `nameSchema` - Name format validation

## Available Types

### Authentication Types

- `UserProfile` - Complete user profile information
- `AuthState` - Authentication state management
- `LoginFormData` - Login form data structure
- `SignupFormData` - Signup form data structure
- `OAuthProviderConfig` - OAuth provider configuration
- `UserSessionComposable` - Composable interface for auth management

### Database Types

- `User` - User entity from database
- `Account` - OAuth account entity
- `Session` - User session entity
- `NewUser`, `NewAccount`, `NewSession` - Insert types
- `UserWithRelations` - User with related entities

## Validation Rules

### Password Requirements
- Minimum 8 characters
- Maximum 128 characters
- Must contain at least one lowercase letter
- Must contain at least one uppercase letter
- Must contain at least one number

### Username Requirements
- Minimum 3 characters
- Maximum 30 characters
- Only letters, numbers, underscores, and hyphens allowed

### Email Requirements
- Valid email format
- Automatically converted to lowercase
- Trimmed of whitespace

### Name Requirements
- Minimum 1 character
- Maximum 50 characters
- Only letters, spaces, hyphens, and apostrophes allowed

## Best Practices

1. **Always validate on both frontend and backend** - Frontend validation improves UX, backend validation ensures security
2. **Use the shared schemas** - Don't create duplicate validation logic
3. **Type your API responses** - Use the provided types for consistent data structures
4. **Handle validation errors gracefully** - Provide clear error messages to users
5. **Keep schemas in sync** - Update both frontend and backend when requirements change

## Extending

To add new schemas or types:

1. Create the schema in the appropriate file under `schema/`
2. Create the corresponding types in the appropriate file under `types/`
3. Export them from the respective `index.ts` files
4. Update this README with documentation

## Migration from Old Code

If you're migrating from the old validation approach:

1. Replace `z.object()` calls with imported schemas
2. Replace manual type definitions with imported types
3. Update form field configurations to use the new `FieldType` interface
4. Update API endpoints to use the new validation and response types
