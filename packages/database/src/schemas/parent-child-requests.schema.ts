import { int, sqliteTable, text, index, uniqueIndex, integer } from 'drizzle-orm/sqlite-core';

/**
 * Schema for parent-child request relationships from ManageEngine
 */
export const parentChildRequests = sqliteTable(
  'parent_child_requests',
  {
    id: int().primaryKey({ autoIncrement: true }),
    requestId: text('request_id').notNull(),
    linkedRequestId: text('linked_request_id').notNull(),
    requestIdLink: text('request_id_link'),
    linkedRequestIdLink: text('linked_request_id_link'),
    createdAt: integer('created_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (table) => [
    // Indexes for faster queries
    index('linked_request_id_idx').on(table.linkedRequestId),
    index('request_id_idx').on(table.requestId),
    // Unique constraint to prevent duplicates
    uniqueIndex('unique_relationship_idx').on(
      table.requestId,
      table.linkedRequestId,
    ),
  ],
);

// Type inference
export type ParentChildRequest = typeof parentChildRequests.$inferSelect;
export type InsertParentChildRequest = typeof parentChildRequests.$inferInsert;
