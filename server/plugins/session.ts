import { sessionService } from '../utils/session'

export default defineNitroPlugin(() => {
    sessionHooks.hook('fetch', async (session, event) => {
        if (!session.sessionId) {
            throw createError({ statusCode: 401, message: 'Invalid session' })
        }

        // Use enhanced getSession method
        const validatedSession = await sessionService.getSession(event)
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