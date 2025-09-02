import { sessionService } from '../utils/session'
/* import { getActiveSubscriptionForUser, getSubscriptionWithEntitlements } from '../utils/subscription'
 */
export default defineNitroPlugin(() => {
  // Called when the session is fetched during SSR for the Vue composable (/api/_auth/session)
  // Or when we call useUserSession().fetch()
  sessionHooks.hook('fetch', async (session, event) => {
    try {
      if (!session?.sessionId) {
        throw createError({ statusCode: 401, message: 'Invalid session' })
      }

      // Use enhanced getSession method with error handling
      const validatedSession = await sessionService.getSession(event)
      if (!validatedSession) {
        throw createError({ statusCode: 401, message: 'Session expired or invalid' })
      }

      // Check session freshness if required (only when enabled)
      if (sessionService.config.requireFreshness && validatedSession.sessionId) {
        const isFresh = await sessionService.checkSessionFreshness(validatedSession.sessionId)
        if (!isFresh) {
          throw createError({ statusCode: 401, message: 'Session not fresh' })
        }
      }

      // Safe access to session data with null checks
      const sessionMetadata = validatedSession.dbSession
        ? {
            ipAddress: validatedSession.dbSession.ipAddress || 'unknown',
            userAgent: validatedSession.dbSession.userAgent || 'unknown'
          }
        : {
            ipAddress: 'unknown',
            userAgent: 'unknown'
          }

      // Load subscription data for the user
      const subscriptionData = null
      if (validatedSession.user?.id) {
        /*  const dbSubscription = await getActiveSubscriptionForUser(validatedSession.user.id)
        subscriptionData = getSubscriptionWithEntitlements(dbSubscription) */
      }

      return {
        ...session,
        lastActivity: validatedSession.lastActivity || new Date(),
        sessionMetadata,
        subscription: subscriptionData
      }
    } catch (error) {
      console.error('Session validation error:', error)
      // Clear invalid session to prevent memory leaks
      await clearUserSession(event)
      throw createError({ statusCode: 401, message: 'Session validation failed' })
    }
  })

  // Called when we call useUserSession().clear() or clearUserSession(event)
  sessionHooks.hook('clear', async (session, event) => {
    try {
      if (session?.sessionId) {
        await sessionService.revokeCurrentSession(event, 'logout')
      }
    } catch (error) {
      console.error('Session clear error:', error)
    }
  })
})
