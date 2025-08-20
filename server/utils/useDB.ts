import { drizzle } from 'drizzle-orm/d1'
import { eq, and, or, desc, like } from 'drizzle-orm'
import * as schema from '../db/schemas/schema'
import * as authSchema from '../db/schemas/auth-schema'
import Database from 'better-sqlite3'

export { eq, and, or, desc, like }
export const tables = schema

export function useDB() {
  // if we deploy cloudflare and use D1 with nuxt hub
  // return drizzle(hubDatabase(), { schema: { ...schema, ...authSchema } });

  // with basic sqlite
  const sqlite = new Database('./server/db/data.db')
  return drizzle(sqlite, { schema: { ...authSchema, ...schema } })
}
