import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { generateUuidV8 } from '../../../shared/uuid';

export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUuidV8()),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const groups = pgTable(
  'groups',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => generateUuidV8()),
    externalId: text('external_id').notNull(),
    description: text('description').notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    externalIdIdx: uniqueIndex('groups_external_id_unique').on(
      table.externalId,
    ),
  }),
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type GroupRow = typeof groups.$inferSelect;
export type NewGroupRow = typeof groups.$inferInsert;
