import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { form, query } from '$app/server';
import { db } from '$lib/server/db';
import { broadcastsTable } from '$lib/server/db/schema';
import { getVideoInfo } from '$lib/server/download/twitch';

export const getBroadcasts = query(async () => {
	const broadcasts = await db.select().from(broadcastsTable);

	return broadcasts;
});

export const getBroadcast = query(v.number(), async (id: number) => {
	const broadcast = await db.select().from(broadcastsTable).where(eq(broadcastsTable.id, id));

	// Return the first broadcast or null
	return broadcast[0];
});

export const getBroadcastInfo = query(
	v.string(),
	async (url: string): Promise<ReturnType<typeof getVideoInfo>> => {
		const info = await getVideoInfo(url);

		return info;
	}
);

export const createBroadcastFromVideo = form(
	v.object({
		url: v.string(),
		quality: v.string(),
		startTime: v.optional(v.string()),
		endTime: v.optional(v.string()),
	}),
	async ({ url /*, quality, startTime, endTime */ }) => {
		// Redirect to the URL for now!
		redirect(303, url);
	}
);
