import { json } from '@sveltejs/kit';
import { getPage, updatePage, deletePage } from '$lib/server/db';

export async function GET({ params }) {
	try {
		const { id } = params;
		const page = await getPage(id);
		if (!page) {
			return json({ error: 'Page not found' }, { status: 404 });
		}
		return json(page);
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : 'Failed to load page' }, { status: 500 });
	}
}

export async function PUT({ params, request }) {
	try {
		const { id } = params;
		const data = await request.json();
		const page = await updatePage(id, data);
		if (!page) {
			return json({ error: 'Page not found' }, { status: 404 });
		}
		return json(page);
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : 'Failed to update page' }, { status: 500 });
	}
}

export async function DELETE({ params }) {
	try {
		const { id } = params;
		const deleted = await deletePage(id);
		if (!deleted) {
			return json({ error: 'Page not found' }, { status: 404 });
		}
		return json({ success: true });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : 'Failed to delete page' }, { status: 500 });
	}
}
