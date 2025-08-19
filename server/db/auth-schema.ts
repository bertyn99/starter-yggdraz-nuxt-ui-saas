import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import crypto from 'node:crypto'

// =================================================================
// AUTHENTICATION SCHEMA (Following Lucia-auth & Auth.js conventions)
// =================================================================

// The core `users` table holds identity information.
export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
    username: text('username').notNull().unique(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    phoneNumber: text('phone_number'),
    role: text('role', { enum: ["user", "admin", "staff"] }).default('user'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`)
});

// The `accounts` table links OAuth providers to users.
export const accounts = sqliteTable('accounts', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    provider: text('provider', { enum: ["credentials", "google", "facebook", "apple", "twitter", "github"] }).notNull(), // e.g., 'google', 'facebook'
    providerAccountId: text('provider_account_id').notNull(),
    userId: text('user_id').references(() => users.id).notNull(),
    // OAuth provider tokens
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: integer('expires_at'),
    refreshTokenExpiresAt: integer('refresh_token_expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    hashedPassword: text('hashed_password'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`)
});

// The `sessions` table stores user sessions for authentication.
export const sessions = sqliteTable('sessions', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomBytes(12).toString('hex')),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    token: text('token').notNull(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`)
});

// =================================================================
// ORGANIZATION SCHEMA
// =================================================================

/* Organizations table for multi-tenancy
export const organizations = sqliteTable('organizations', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    logo: text('logo'),
    domain: text('domain'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`)
});

// User-Organization relationships (many-to-many)
export const usersToOrganizations = sqliteTable('users_to_organizations', {
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    role: text('role', { enum: ["owner", "admin", "member", "viewer"] }).notNull().default('member'),
    joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.organizationId] })
}));
*/

// =================================================================
// ROLE & PERMISSION SCHEMA
// =================================================================

/* Roles table for fine-grained permissions
export const roles = sqliteTable('roles', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
    isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`)
});

 // Permissions table
export const permissions = sqliteTable('permissions', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull().unique(),
    description: text('description'),
    resource: text('resource').notNull(), // e.g., 'user', 'post', 'organization'
    action: text('action').notNull(), // e.g., 'create', 'read', 'update', 'delete'
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`)
});

// Role-Permission relationships (many-to-many)
export const rolesToPermissions = sqliteTable('roles_to_permissions', {
    roleId: text('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    permissionId: text('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
    grantedAt: integer('granted_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`)
}, (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] })
}));
 */
// =================================================================
// RELATIONS
// =================================================================

export const usersRelations = {
    accounts: relations('accounts', {
        fields: [users.id],
        references: [accounts.userId]
    }),
    sessions: relations('sessions', {
        fields: [users.id],
        references: [sessions.userId]
    }),
    organizations: relations('organizations', {
        fields: [users.id],
        references: [usersToOrganizations.userId]
    })
};

export const organizationsRelations = {
    users: relations('users', {
        fields: [organizations.id],
        references: [usersToOrganizations.organizationId]
    }),
    roles: relations('roles', {
        fields: [organizations.id],
        references: [roles.organizationId]
    })
};

// =================================================================
// TYPE EXPORTS
// =================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
