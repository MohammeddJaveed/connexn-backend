import { timestamp, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { regions } from './region.ts';
import { roles } from './roles.ts';

export const users = pgTable('users', {
  userId: uuid('user_id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 254 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  roleId: uuid('role_id')
    .notNull()
    .references(() => roles.id),
  regionId: uuid('region_id')
    .notNull()
    .references(() => regions.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
