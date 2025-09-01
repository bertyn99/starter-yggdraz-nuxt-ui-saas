import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import crypto from 'node:crypto'

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  plan: text('plan').notNull(), // store lower-cased name
  referenceId: text('reference_id').notNull().unique(), // one row per reference
  // optional type for future org/team support: "user" | "org"
  referenceType: text('reference_type', { enum: ['user', 'org'] }),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  status: text('status', {
    enum: [
      'incomplete',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'incomplete_expired',
      'paused'
    ]
  }).notNull().default('incomplete'),
  periodStart: integer('period_start', { mode: 'timestamp' }),
  periodEnd: integer('period_end', { mode: 'timestamp' }),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
  seats: integer('seats'),
  trialStart: integer('trial_start', { mode: 'timestamp' }),
  trialEnd: integer('trial_end', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s','now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s','now'))`)
}, table => ([
  index('subscriptions_reference_id_idx').on(table.referenceId),
  index('subscriptions_status_idx').on(table.status),
  index('subscriptions_plan_idx').on(table.plan)
]))
