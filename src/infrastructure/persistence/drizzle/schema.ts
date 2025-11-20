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

export const userTastes = pgTable(
  'user_tastes',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => generateUuidV8()),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    normalizedLabel: text('normalized_label').notNull(),
    embeddingModel: text('embedding_model').notNull(),
    qdrantPointId: text('qdrant_point_id').notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueTastePerUser: uniqueIndex('user_tastes_user_label_unique').on(
      table.userId,
      table.normalizedLabel,
    ),
  }),
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type GroupRow = typeof groups.$inferSelect;
export type NewGroupRow = typeof groups.$inferInsert;
export type UserTasteRow = typeof userTastes.$inferSelect;
export type NewUserTasteRow = typeof userTastes.$inferInsert;
