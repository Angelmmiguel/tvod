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
	// Local file path
	path: text('path').notNull(),
});
