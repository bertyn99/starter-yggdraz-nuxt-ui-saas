// server/utils/session.ts
import { eq, and, lt, ne, sql, desc } from 'drizzle-orm'
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
    disableSessionRefresh: boolean // Default: false
    cookieCache: {
        enabled: boolean
        maxAge: number // Cache duration in seconds
    }
}

interface UserData {
    id: string
    email: string
    /* role: string */
    username: string
}

interface SessionOptions {
    userAgent?: string
    ipAddress?: string
    remember?: boolean
    disableRefresh?: boolean
}

interface SessionQueryOptions {
    disableCookieCache?: boolean
    disableRefresh?: boolean
}

export class SessionService {
    public config: SessionConfig
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
            disableSessionRefresh: false,
            cookieCache: {
                enabled: false,
                maxAge: 5 * 60 // 5 minutes
            },
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
                sessionId: session.id,
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
     * Get and validate session with Better Auth-style logic
     */
    async getSession(event: H3Event, options?: SessionQueryOptions) {
        try {
            const session = await getUserSession(event)

            if (!session?.sessionId) {
                return null
            }

            // Check cookie cache if enabled
            if (this.config.cookieCache.enabled && !options?.disableCookieCache) {
                const cachedSession = await this.getCachedSession(event, session)
                if (cachedSession) {
                    return cachedSession
                }
            }

            // Find session in database
            const dbSession = await this.db.query.sessions.findFirst({
                where: and(
                    eq(sessions.id, session.sessionId),
                    eq(sessions.userId, session.user?.id),
                    lt(sessions.expiresAt, sql`(strftime('%s', 'now'))`)
                ),
                with: {
                    user: true
                }
            })

            if (!dbSession) {
                await clearUserSession(event)
                return null
            }

            // Check if session is expired
            if (dbSession.expiresAt < new Date()) {
                await this.deleteSession(dbSession.token)
                await clearUserSession(event)
                return null
            }

            // Handle session refresh logic
            if (!options?.disableRefresh && !this.config.disableSessionRefresh) {
                const refreshedSession = await this.handleSessionRefresh(dbSession, event)
                if (refreshedSession) {
                    return refreshedSession
                }
            }

            // Update last activity if tracking is enabled
            if (this.config.trackActivity) {
                await this.trackSessionActivity(session.sessionId, event)
            }

            // Set cookie cache if enabled
            if (this.config.cookieCache.enabled) {
                await this.setCookieCache(event, { session: dbSession, user: session.user })
            }

            return {
                ...session,
                dbSession,
                lastActivity: dbSession.updatedAt
            }
        } catch (error) {
            console.error('Error getting session:', error)
            return null
        }
    }

    /**
     * Handle session refresh logic (Better Auth style)
     */
    private async handleSessionRefresh(dbSession: any, event: H3Event) {
        const now = new Date()
        const sessionAge = now.getTime() - dbSession.createdAt.getTime()
        const updateAgeMs = this.config.updateAge * 1000

        // Calculate if session should be updated (Better Auth formula)
        const sessionIsDueToBeUpdatedDate =
            dbSession.expiresAt.valueOf() -
            this.config.expiresIn * 1000 +
            this.config.updateAge * 1000

        const shouldBeUpdated = sessionIsDueToBeUpdatedDate <= Date.now()

        if (shouldBeUpdated && sessionAge > updateAgeMs) {
            const newExpiresAt = new Date(now.getTime() + this.config.expiresIn * 1000)

            const [updatedSession] = await this.db.update(sessions)
                .set({
                    expiresAt: newExpiresAt,
                    updatedAt: now
                })
                .where(eq(sessions.id, dbSession.id))
                .returning()

            if (updatedSession) {
                // Update cookie session with new expiration
                const currentSession = await getUserSession(event)
                if (currentSession) {
                    await setUserSession(event, {
                        ...currentSession,
                        expiresAt: newExpiresAt
                    })
                }

                return {
                    ...currentSession,
                    dbSession: updatedSession,
                    lastActivity: updatedSession.updatedAt
                }
            }
        }

        return null
    }

    /**
     * Check session freshness (Better Auth style)
     */
    async checkSessionFreshness(sessionId: string, requiredAge?: number): Promise<boolean> {
        try {
            const session = await this.db.query.sessions.findFirst({
                where: eq(sessions.id, sessionId)
            })

            if (!session) {
                return false
            }

            const freshAge = requiredAge || this.config.freshAge
            if (freshAge === 0) {
                return true // Disabled
            }

            const lastUpdated = session.updatedAt?.valueOf() || session.createdAt.valueOf()
            const now = Date.now()
            const isFresh = (now - lastUpdated) < freshAge * 1000

            return isFresh
        } catch (error) {
            console.error('Error checking session freshness:', error)
            return false
        }
    }

    /**
     * Cookie cache management (Better Auth style)
     */
    private async getCachedSession(event: H3Event, session: any) {
        // This would implement cookie-based caching similar to Better Auth
        // For now, return null to always hit database
        return null
    }

    private async setCookieCache(event: H3Event, sessionData: any) {
        // This would implement setting cookie cache
        // Implementation depends on your cookie strategy
    }

    /**
     * Delete session from database
     */
    async deleteSession(token: string): Promise<boolean> {
        try {
            const result = await this.db.delete(sessions)
                .where(eq(sessions.token, token))

            return (result.changes || 0) > 0
        } catch (error) {
            console.error('Error deleting session:', error)
            return false
        }
    }

    /**
     * List all active sessions for a user (Better Auth style)
     */
    async listUserSessions(userId: string) {
        try {
            const userSessions = await this.db.query.sessions.findMany({
                where: and(
                    eq(sessions.userId, userId),
                    lt(sessions.expiresAt, sql`(strftime('%s', 'now'))`)
                ),
                orderBy: [desc(sessions.updatedAt)]
            })

            // Filter active sessions
            const activeSessions = userSessions.filter(session =>
                session.expiresAt > new Date()
            )

            return activeSessions.map(session => ({
                id: session.id,
                token: session.token,
                userAgent: session.userAgent,
                ipAddress: session.ipAddress,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                expiresAt: session.expiresAt,
                isCurrent: false
            }))
        } catch (error) {
            console.error('Error listing user sessions:', error)
            return []
        }
    }

    /**
     * Revoke specific session (Better Auth style)
     */
    async revokeSession(token: string, userId: string): Promise<boolean> {
        try {
            // Verify session belongs to user
            const session = await this.db.query.sessions.findFirst({
                where: and(
                    eq(sessions.token, token),
                    eq(sessions.userId, userId)
                )
            })

            if (!session) {
                return false
            }

            return await this.deleteSession(token)
        } catch (error) {
            console.error('Error revoking session:', error)
            return false
        }
    }

    /**
     * Revoke all sessions for user (Better Auth style)
     */
    async revokeAllSessions(userId: string): Promise<number> {
        try {
            const result = await this.db.delete(sessions)
                .where(eq(sessions.userId, userId))

            return result.changes || 0
        } catch (error) {
            console.error('Error revoking all sessions:', error)
            return 0
        }
    }

    /**
     * Revoke other sessions except current (Better Auth style)
     */
    async revokeOtherSessions(userId: string, currentToken: string): Promise<number> {
        try {
            const result = await this.db.delete(sessions)
                .where(and(
                    eq(sessions.userId, userId),
                    ne(sessions.token, currentToken)
                ))

            return result.changes || 0
        } catch (error) {
            console.error('Error revoking other sessions:', error)
            return 0
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
                    lt(sessions.expiresAt, sql`(strftime('%s', 'now'))`)
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
     * Get client IP address
     */
    private getClientIP(event: H3Event): string {
        return event.headers.get('x-forwarded-for') ||
            event.headers.get('x-real-ip') ||
            event.node.req.socket.remoteAddress ||
            'unknown'
    }

    /**
     * Clean up expired sessions
     */
    async cleanupExpiredSessions() {
        try {
            const result = await this.db.delete(sessions)
                .where(lt(sessions.expiresAt, sql`(strftime('%s', 'now'))`))

            return result.changes || 0
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error)
            return 0
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

            // Mark session as revoked in database
            await this.db.update(sessions)
                .set({
                    updatedAt: new Date()
                })
                .where(eq(sessions.id, session.sessionId))

            // Clear cookie session
            await clearUserSession(event)

            return true
        } catch (error) {
            console.error('Error revoking session:', error)
            return false
        }
    }
}

export const sessionService = new SessionService()