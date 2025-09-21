import { drizzle } from 'drizzle-orm/better-sqlite3'


let drizzleInstance: ReturnType<typeof drizzle> | null = null;

export function useDB() {

    if (!drizzleInstance) {
        console.log('Creating a new instance of drizzle')
    }

    return drizzleInstance
}