import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: ['./server/db/schemas/*.ts'],
  out: './server/db/migrations',
  dialect: 'sqlite',
  //
  dbCredentials: {
    url: './server/db/data.db'
  }
})
