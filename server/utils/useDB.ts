import { drizzle } from 'drizzle-orm/better-sqlite3'
// import { drizzle } from 'drizzle-orm/d1'
import { eq, and, or, desc, like } from 'drizzle-orm'
import * as schema from '../db/schemas/schema'
import * as authSchema from '../db/schemas/auth-schema'
import Database from 'better-sqlite3'
import process from 'node:process'
import { resolve } from 'node:path'

export { eq, and, or, desc, like }
export const tables = schema

let drizzleInstance: ReturnType<typeof drizzle> | null = null;

export function useDB() {

  if (!drizzleInstance) {

    console.log('Creating a new instance of drizzle')

    //if we use a postgres database
    /*
      const pool = new Pool({
        max: parseInt(process.env.PGPOOL_MAX ?? '5', 10),
        connectionString: process.env.DATABASE_URL!,
        connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT ?? '5000', 10),
      });

      pool.on('connect', async (client) => {
      // Session hardening; wrap in try/catch to avoid failing the connection
        try {
          await client.query(`SET TIME ZONE 'UTC'`)
          await client.query(`SET application_name = $1`, [process.env.PG_APP_NAME ?? 'nuxt-app'])
          await client.query(`SET statement_timeout = ${parseInt(process.env.PG_STATEMENT_TIMEOUT ?? '5000', 10)}`)
          await client.query(`SET idle_in_transaction_session_timeout = ${parseInt(process.env.PG_IDLE_TX_TIMEOUT ?? '30000', 10)}`)
          await client.query(`SET lock_timeout = ${parseInt(process.env.PG_LOCK_TIMEOUT ?? '5000', 10)}`)
        } catch (e) {
          console.warn('pg connect session setup failed:', e)
        }
      })

      drizzleInstance = drizzle(pool, { schema: { ...authSchema, ...schema } })
      console.log('A new instance of drizzle has been created')
    
    */

    // if we deploy cloudflare and use D1 with nuxt hub
    // return drizzle(hubDatabase(), { schema: { ...schema, ...authSchema } });

    // with basic sqlite
    const filePath = resolve(process.cwd(), 'server/db/data.db')
    const sqlite = new Database(filePath, { timeout: 5000 })
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')
    drizzleInstance = drizzle(sqlite, { schema: { ...authSchema, ...schema } })
    console.log('A new instance of drizzle has been created')

    const close = () => { try { sqlite.close() } catch { } }
    process.once('SIGINT', close)
    process.once('SIGTERM', close)
    process.once('beforeExit', close)
  }

  return drizzleInstance
}
