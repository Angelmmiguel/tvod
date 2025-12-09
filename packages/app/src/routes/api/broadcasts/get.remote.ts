import { query } from '$app/server';
import { db } from '$lib/server/db';
import { broadcastsTable } from '$lib/server/db/schema';

export const getBroadcasts = query(async () => {
	const broadcasts = await db.select().from(broadcastsTable);

	return broadcasts;
});
