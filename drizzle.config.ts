import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: ['./server/db/auth-schema.ts', './server/db/schema.ts'],
  out: './server/db/migrations',
  dialect: 'sqlite'
})
