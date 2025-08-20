import * as argon2 from '@node-rs/argon2'
import { users, accounts } from '../../db/schemas/auth-schema'
import { signupSchema, type SignupSchema } from '../../../shared/schemas/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, signupSchema.safeParse)

    const { email, username, password, firstName, lastName } = body

    const db = useDB()
    const hashedPassword = await argon2.hash(password)

    try {
      // Insert user data into database
      const [user] = await db.insert(users).values({
        username,
        email,
        firstName,
        lastName,
        role: 'user',
        emailVerified: false
      }).returning()

      // Create account record for credentials provider
      await db.insert(accounts).values({
        provider: 'credentials',
        providerAccountId: user.id,
        userId: user.id,
        hashedPassword
      })

      // Create session
      await setUserSession(event, {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.username
        },
        loggedInAt: new Date()
      })

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    } catch (error) {
      console.error('Error creating user:', error)

      // Check for unique constraint violations
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = error.code as string
        if (errorCode === 'SQLITE_CONSTRAINT_UNIQUE') {
          throw createError({
            statusCode: 409,
            message: 'User with this email or username already exists'
          })
        }
      }

      throw createError({
        statusCode: 500,
        message: 'Failed to create user account'
      })
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Error handling signup request:', error)
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})
