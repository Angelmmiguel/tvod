import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { form, query } from '$app/server';
import { db } from '$lib/server/db';
import { broadcastsTable } from '$lib/server/db/schema';

export const getBroadcasts = query(async () => {
	const broadcasts = await db.select().from(broadcastsTable);

	return broadcasts;
});

export const getBroadcast = query(v.number(), async (id: number) => {
	const broadcast = await db.select().from(broadcastsTable).where(eq(broadcastsTable.id, id));

	// Return the first broadcast or null
	return broadcast[0];
});

export const createBroadcastFromVideo = form(
	v.object({
		url: v.string(),
	}),
	async ({ url }) => {
		// Redirect to the URL for now!
		redirect(303, url);
	}
);
