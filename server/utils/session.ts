// server/services/sessionService.ts
import { eq, and, lt, ne } from 'drizzle-orm'
import { sessions, users } from '../db/schemas/auth-schema'
import type { H3Event } from 'h3'

interface SessionConfig {
    expiresIn: number // Default: 7 days
    updateAge: number // Default: 1 day (refresh window)
    freshAge: number // Default: 1 day (freshness requirement)
    maxSessions: number // Default: 10 (per user)
    cleanupInterval: number // Default: 1 hour
    trackActivity: boolean // Default: true
    requireFreshness: boolean // Default: false
}

interface UserData {
    id: string
    email: string
    role: string
    username: string
    firstName?: string | null
    lastName?: string | null
}

interface SessionOptions {
    userAgent?: string
    ipAddress?: string
    remember?: boolean
}

export class SessionService {
    private config: SessionConfig
    private db: ReturnType<typeof useDB>

    constructor(config?: Partial<SessionConfig>) {
        this.config = {
            expiresIn: 60 * 60 * 24 * 7, // 7 days
            updateAge: 60 * 60 * 24, // 1 day
            freshAge: 60 * 60 * 24, // 1 day
            maxSessions: 10,
            cleanupInterval: 60 * 60, // 1 hour
            trackActivity: true,
            requireFreshness: false,
            ...config
        }
        this.db = useDB()
    }

    /**
     * Create a new session - handles both database and cookie
     */
    async createSession(userId: string, event: H3Event, userData: UserData, options?: SessionOptions) {
        try {
            // 1. Check if user has too many sessions
            await this.enforceMaxSessions(userId)

            // 2. Create database session record
            const sessionToken = crypto.randomUUID()
            const expiresAt = new Date(Date.now() + this.config.expiresIn * 1000)

            const [session] = await this.db.insert(sessions).values({
                userId,
                token: sessionToken,
                userAgent: options?.userAgent || event.headers.get('user-agent'),
                ipAddress: options?.ipAddress || this.getClientIP(event),
                expiresAt,
                createdAt: new Date(),
                updatedAt: new Date()
            }).returning()

            // 3. Set cookie session with session ID
            await setUserSession(event, {
                user: userData,
                sessionId: session.id, // Store session ID in cookie
                loggedInAt: new Date()
            })

            return {
                id: session.id,
                token: session.token,
                expiresAt: session.expiresAt,
                user: userData
            }
        } catch (error) {
            console.error('Error creating session:', error)
            throw createError({
                statusCode: 500,
                message: 'Failed to create session'
            })
        }
    }

    /**
     * Validate session against database
     */
    async validateSession(event: H3Event) {
        try {
            const session = await getUserSession(event)

            if (!session?.sessionId) {
                return null
            }

            // Find session in database
            const dbSession = await this.db.query.sessions.findFirst({
                where: and(
                    eq(sessions.id, session?.sessionId || ''),
                    eq(sessions.userId, session?.user?.id || ''),
                    lt(new Date(), sessions.expiresAt)
                ),
                with: {
                    user: true
                }
            })

            if (!dbSession) {
                // Session not found or expired, clear cookie
                await clearUserSession(event)
                return null
            }

            // Update last activity if tracking is enabled
            if (this.config.trackActivity) {
                await this.trackSessionActivity(session?.sessionId || '', event)
            }

            return {
                ...session,
                dbSession,
                lastActivity: dbSession.updatedAt
            }
        } catch (error) {
            console.error('Error validating session:', error)
            return null
        }
    }

    /**
     * Refresh session if within update window
     */
    async refreshSession(event: H3Event) {
        try {
            const session = await this.validateSession(event)

            if (!session) {
                return null
            }

            const now = new Date()
            const sessionAge = now.getTime() - session.dbSession.createdAt.getTime()
            const updateAgeMs = this.config.updateAge * 1000

            // Only refresh if session is older than updateAge
            if (sessionAge > updateAgeMs) {
                const newExpiresAt = new Date(now.getTime() + this.config.expiresIn * 1000)

                await this.db.update(sessions)
                    .set({
                        expiresAt: newExpiresAt,
                        updatedAt: now
                    })
                    .where(eq(sessions.id, session?.sessionId || ''))

                return {
                    ...session,
                    dbSession: {
                        ...session.dbSession,
                        expiresAt: newExpiresAt,
                        updatedAt: now
                    }
                }
            }

            return session
        } catch (error) {
            console.error('Error refreshing session:', error)
            return null
        }
    }

    /**
     * Revoke current session
     */
    async revokeCurrentSession(event: H3Event, reason?: string) {
        try {
            const session = await getUserSession(event)

            if (!session?.sessionId) {
                return false
            }

            // Mark session as revoked in database (we'll add a revokedAt field)
            await this.db.update(sessions)
                .set({
                    updatedAt: new Date()
                    // Note: You might want to add a revokedAt field to your schema
                })
                .where(eq(sessions.id, session?.sessionId || ''))

            // Clear cookie session
            await clearUserSession(event)

            return true
        } catch (error) {
            console.error('Error revoking session:', error)
            return false
        }
    }

    /**
     * List all active sessions for a user
     */
    async listUserSessions(userId: string) {
        try {
            const userSessions = await this.db.query.sessions.findMany({
                where: and(
                    eq(sessions.userId, userId),
                    lt(new Date(), sessions.expiresAt)
                ),
                orderBy: (sessions, { desc }) => [desc(sessions.updatedAt)]
            })

            return userSessions.map(session => ({
                id: session.id,
                userAgent: session.userAgent,
                ipAddress: session.ipAddress,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                expiresAt: session.expiresAt,
                isCurrent: false // Will be set by caller if needed
            }))
        } catch (error) {
            console.error('Error listing user sessions:', error)
            return []
        }
    }

    /**
     * Revoke all sessions for a user
     */
    async revokeUserSessions(userId: string, excludeSessionId?: string) {
        try {
            let whereCondition = and(
                eq(sessions.userId, userId),
                lt(new Date(), sessions.expiresAt)
            )

            if (excludeSessionId) {
                whereCondition = and(whereCondition, ne(sessions.id, excludeSessionId))
            }

            const result = await this.db.update(sessions)
                .set({
                    updatedAt: new Date()
                    // Note: You might want to add a revokedAt field
                })
                .where(whereCondition)

            return result.changes || 0
        } catch (error) {
            console.error('Error revoking user sessions:', error)
            return 0
        }
    }

    /**
     * Clean up expired sessions
     */
    async cleanupExpiredSessions() {
        try {
            const result = await this.db.delete(sessions)
                .where(lt(sessions.expiresAt, new Date()))

            return result.changes || 0
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error)
            return 0
        }
    }

    /**
     * Check if session is fresh (created within freshAge)
     */
    async checkSessionFreshness(sessionId: string, requiredAge?: number) {
        try {
            const session = await this.db.query.sessions.findFirst({
                where: eq(sessions.id, sessionId)
            })

            if (!session) {
                return false
            }

            const freshAge = requiredAge || this.config.freshAge
            const sessionAge = Date.now() - session.createdAt.getTime()
            const freshAgeMs = freshAge * 1000

            return sessionAge <= freshAgeMs
        } catch (error) {
            console.error('Error checking session freshness:', error)
            return false
        }
    }

    /**
     * Track session activity
     */
    private async trackSessionActivity(sessionId: string, event: H3Event) {
        try {
            await this.db.update(sessions)
                .set({
                    updatedAt: new Date(),
                    userAgent: event.headers.get('user-agent'),
                    ipAddress: this.getClientIP(event)
                })
                .where(eq(sessions.id, sessionId))
        } catch (error) {
            console.error('Error tracking session activity:', error)
        }
    }

    /**
     * Enforce maximum sessions per user
     */
    private async enforceMaxSessions(userId: string) {
        try {
            const userSessionCount = await this.db.query.sessions.findMany({
                where: and(
                    eq(sessions.userId, userId),
                    lt(new Date(), sessions.expiresAt)
                )
            })

            if (userSessionCount.length >= this.config.maxSessions) {
                // Remove oldest sessions
                const sessionsToRemove = userSessionCount
                    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                    .slice(0, userSessionCount.length - this.config.maxSessions + 1)

                for (const session of sessionsToRemove) {
                    await this.db.delete(sessions).where(eq(sessions.id, session.id))
                }
            }
        } catch (error) {
            console.error('Error enforcing max sessions:', error)
        }
    }

    /**
     * Get client IP address
     */
    private getClientIP(event: H3Event): string {
        return event.headers.get('x-forwarded-for') ||
            event.headers.get('x-real-ip') ||
            event.node.req.socket.remoteAddress ||
            'unknown'
    }
}

// Export singleton instance
export const sessionService = new SessionService()