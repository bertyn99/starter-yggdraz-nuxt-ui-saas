// server/plugins/session.ts
import { sessionService } from '../utils/session'

export default defineNitroPlugin(() => {
    sessionHooks.hook('fetch', async (session, event) => {
        if (!session.sessionId) {
            throw createError({ statusCode: 401, message: 'Invalid session' })
        }

        // Validate session against database
        const validatedSession = await sessionService.validateSession(event)
        if (!validatedSession) {
            throw createError({ statusCode: 401, message: 'Session expired or invalid' })
        }

        // Check session freshness if required
        if (sessionService.config.requireFreshness) {
            const isFresh = await sessionService.checkSessionFreshness(session.sessionId)
            if (!isFresh) {
                throw createError({ statusCode: 401, message: 'Session not fresh' })
            }
        }

        // Return enhanced session data
        return {
            ...session,
            lastActivity: validatedSession.lastActivity,
            sessionMetadata: {
                ipAddress: validatedSession.dbSession.ipAddress,
                userAgent: validatedSession.dbSession.userAgent
            }
        }
    })

    sessionHooks.hook('clear', async (session, event) => {
        if (session.sessionId) {
            await sessionService.revokeCurrentSession(event, 'logout')
        }
    })
})