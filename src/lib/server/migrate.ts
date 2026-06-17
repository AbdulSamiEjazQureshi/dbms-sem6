import mongoose from 'mongoose';
import { Page } from './models/Page';


const SCHEMA_VERSION = 1;


export async function runMigrations(): Promise<void> {
	const db = mongoose.connection.db!;
	if (!db) throw new Error('Database not connected');

	const collections = await db.listCollections().toArray();
	const collectionNames = collections.map((c) => c.name);

	if (!collectionNames.includes('pages')) {
		await db.createCollection('pages');
		console.log('[migrate] Created "pages" collection');
	}

	if (!collectionNames.includes('page_migrations')) {
		await db.createCollection('page_migrations');
		console.log('[migrate] Created "page_migrations" collection');
	}

	const count = await Page.countDocuments();
	if (count === 0) {
		await Page.create({ schema_version: SCHEMA_VERSION });
		console.log('[migrate] Seeded default page document');
	}

	
	const outdatedCount = await Page.countDocuments({ schema_version: { $lt: SCHEMA_VERSION } });
	if (outdatedCount > 0) {

		
		await Page.updateMany(
			{ schema_version: { $lt: SCHEMA_VERSION } },
			{ $set: { schema_version: SCHEMA_VERSION } }
		);

		console.log(`[migrate] Upgraded ${outdatedCount} document(s) to schema v${SCHEMA_VERSION}`);
	}


	const migrations = db.collection('page_migrations');
	await migrations.insertOne({
		schema_version: SCHEMA_VERSION,
		upgraded_docs: outdatedCount,
		ran_at: new Date().toISOString(),
	});

	console.log(`[migrate] Schema v${SCHEMA_VERSION} is current (${count} documents)`);
}
