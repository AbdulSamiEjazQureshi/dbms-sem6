import { json } from '@sveltejs/kit';
import { listPages, createPage } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	try {
		const userId = event.locals.user?._id;
		const pages = await listPages(userId);
		return json({ pages });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : 'Failed to load pages' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const userId = event.locals.user?._id;
		const data = await event.request.json();
		if (!data.name || !data.name.trim()) {
			return json({ error: 'Page name is required' }, { status: 400 });
		}
		const page = await createPage(data, userId);
		return json(page, { status: 201 });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : 'Failed to create page' }, { status: 500 });
	}
};
