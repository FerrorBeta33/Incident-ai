import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const incidents = sqliteTable('incidents', {
  id: text('id').primaryKey(),
  number: integer('number').notNull().unique(),
  title: text('title').notNull(),
  service: text('service').notNull(),
  description: text('description').notNull(),
  severity: text('severity').notNull(),
  status: text('status').notNull(),
  commander: text('commander').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const incidentEvents = sqliteTable('incident_events', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id')
    .notNull()
    .references(() => incidents.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  message: text('message').notNull(),
  actor: text('actor').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const actionItems = sqliteTable('action_items', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id')
    .notNull()
    .references(() => incidents.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  assignee: text('assignee').notNull(),
  dueDate: text('due_date').notNull(),
  status: text('status').notNull(),
});

export const publicStatusUpdates = sqliteTable('public_status_updates', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').references(() => incidents.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  body: text('body').notNull(),
  component: text('component').notNull(),
  status: text('status').notNull(),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
