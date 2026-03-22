import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const subjectTranslations = sqliteTable('subject_translations', {
  requestId: integer('request_id').primaryKey(),
  subject: text('subject').notNull(),
  subjectEnglish: text('subject_english').notNull(),
});

export type SubjectTranslation = typeof subjectTranslations.$inferSelect;
export type InsertSubjectTranslation = typeof subjectTranslations.$inferInsert;
