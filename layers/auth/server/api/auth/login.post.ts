// server/api/auth/login.post.ts
import * as argon2 from '@node-rs/argon2'
import { eq } from 'drizzle-orm'
import { users, accounts } from '~~/server/db/schemas/auth-schema'
import { loginSchema } from '#shared/schemas/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, loginSchema.parse)

    const { email, password } = body
    const db = useDB()

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    // Find account by user id
    const account = await db.query.accounts.findFirst({
      where: eq(accounts.userId, user.id)
    })

    if (!account?.hashedPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    // Compare password with hashed password in db
    const isValid = await argon2.verify(account.hashedPassword, password)
    if (!isValid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    // Create session using service
    const session = await sessionService.createSession(user.id, event, {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      username: user.username,
      firstName: user.firstName || '',
      lastName: user.lastName || ''
    })

    return session.user
  } catch (error: any) {
    console.error('Login error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})
