import { drizzle } from 'drizzle-orm/better-sqlite3'
import { eq, and, or, desc, like } from 'drizzle-orm'
import * as authSchema from '../db/schemas/auth-schema'
import Database from 'better-sqlite3'
import process from 'node:process'
import { resolve } from 'node:path'

export { eq, and, or, desc, like }

let drizzleInstance: ReturnType<typeof drizzle> | null = null;

export function useDB() {
  if (!drizzleInstance) {
    console.log('Creating a new instance of drizzle')

    // with basic sqlite
    const filePath = resolve(process.cwd(), 'server/db/data.db')
    const sqlite = new Database(filePath, { timeout: 5000 })
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')
    drizzleInstance = drizzle(sqlite, { schema: authSchema })
    console.log('A new instance of drizzle has been created')

    const close = () => {
      try { sqlite.close() } catch {
        console.error('Error closing database connection')
      }
    }
    process.once('SIGINT', close)
    process.once('SIGTERM', close)
    process.once('beforeExit', close)
  }

  return drizzleInstance
}