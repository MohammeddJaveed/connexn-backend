import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  postId: uuid('post_id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  userId: uuid('user_id').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
