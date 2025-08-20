// =================================================================
// TYPE EXPORTS
// =================================================================

import type { accounts, sessions, users } from '~~/server/db/schemas/auth-schema'

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
