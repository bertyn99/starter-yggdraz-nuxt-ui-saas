// server/api/auth/signup.post.ts
import * as argon2 from '@node-rs/argon2'
import { users, accounts } from '../../db/schemas/auth-schema'
import { signupSchema } from '../../../shared/schemas/auth'
import { sessionService } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, signupSchema.parse)

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

    // Create session using service
    const session = await sessionService.createSession(user.id, event, {
      id: user.id,
      email: user.email,
      /* role: user.role, */
      username: user.username,
      firstName: user.firstName || '',
      lastName: user.lastName || ''
    })

    return {
      success: true,
      user: session.user
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
})