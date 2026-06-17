import { json } from '@sveltejs/kit';
import { initDatabase, getDbName } from '$lib/server/db';

export async function POST() {
	try {
		await initDatabase();
		return json({ success: true, database: getDbName() });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : 'Initialization failed' }, { status: 500 });
	}
}
