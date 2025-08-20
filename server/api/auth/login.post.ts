import * as argon2 from '@node-rs/argon2'
import { eq } from 'drizzle-orm'
import { users, sessions, accounts } from '../../db/schemas/auth-schema'
import { loginSchema } from '../../../shared/schemas/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, loginSchema.safeParse)

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

    // Create session in DB
    const sessionToken = crypto.randomUUID()
    await db.insert(sessions).values({
      userId: user.id,
      token: sessionToken,
      userAgent: event.headers.get('user-agent'),
      ipAddress: event.headers.get('x-forwarded-for') || event.node.req.socket.remoteAddress,
      expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000) // 1 week
    })

    // Create session
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username
      }
    })

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    }
  } catch (error: unknown) {
    console.error('Login error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})
