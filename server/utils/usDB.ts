import { drizzle } from 'drizzle-orm/d1';
import { eq, and, or, desc, like } from 'drizzle-orm';
import * as schema from '../db/schema';
import * as authSchema from '../db/auth-schema';
import Database = require('better-sqlite3');


export { eq, and, or, desc, like };
export const tables = schema;

export function useDrizzle() {


  //if we deploy cloudflare and use D1 with nuxt hub
  //return drizzle(hubDatabase(), { schema: { ...schema, ...authSchema } });

  //with basic sqlite
  const sqlite = new Database('data.db');
  return drizzle(sqlite, { schema: { ...schema, ...authSchema } });
}
