import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const channelsTable = sqliteTable('channels', {
	// Main ID
	id: integer('id').primaryKey(),
	// Channel name
	name: text('name').notNull(),
	// Original Twitch ID
	twitch_id: integer('twitch_id').notNull().unique(),
	// Following
	isFollowing: integer('is_following').notNull().default(0),
});

export const broadcastsTable = sqliteTable('broadcasts', {
	// Main ID
	id: integer('id').primaryKey(),
	// Original Twitch name
	twitch_id: integer('twitch_id').notNull().unique(),
	// Broadcast title
	title: text('title').notNull(),
	// Related channel
	channelId: integer('channel_id')
		.notNull()
		.references(() => channelsTable.id),
	// Published at timestamp
	publishedAt: integer('published_at', { mode: 'timestamp' }).notNull(),
	// Stream duration in seconds
	duration: integer('duration').notNull(),
	// Local file size in bytes
	size: integer('size').notNull(),
	// Download quality
	quality: text('quality').notNull(),
	// Local file path
	path: text('path').notNull(),
});

export const jobsTable = sqliteTable('jobs', {
	// Main ID
	id: integer('id').primaryKey(),
	// Related broadcast
	broadcastId: integer('broadcast_id')
		.notNull()
		.references(() => broadcastsTable.id),
	// Job status. Could be 'pending', 'in_progress', 'completed' or 'failed'.
	status: text('status').notNull(),
	// Progress
	progress: integer('progress').notNull().default(0),
	// Any kind of message
	message: text('message'),
	// Created at timestamp
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	// Updated at timestamp
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
