import { json } from '@sveltejs/kit';
import { listPages, createPage } from '$lib/server/db';

export async function GET() {
	try {
		const pages = await listPages();
		return json({ pages });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : 'Failed to load pages' }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		const data = await request.json();
		if (!data.name || !data.name.trim()) {
			return json({ error: 'Page name is required' }, { status: 400 });
		}
		const page = await createPage(data);
		return json(page, { status: 201 });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : 'Failed to create page' }, { status: 500 });
	}
}
