import mongoose from 'mongoose';
import { Page } from './models/Page';
import { User } from './models/User';

const SCHEMA_VERSION = 2;

export async function runMigrations(): Promise<void> {
	const db = mongoose.connection.db!;
	if (!db) throw new Error('Database not connected');

	const collections = await db.listCollections().toArray();
	const collectionNames = collections.map((c) => c.name);

	if (!collectionNames.includes('pages')) {
		await db.createCollection('pages');
	}
	if (!collectionNames.includes('users')) {
		await db.createCollection('users');
	}
	if (!collectionNames.includes('page_migrations')) {
		await db.createCollection('page_migrations');
	}

	// --- Schema v1 -> v2: add user_id to existing pages ---
	// If there are pages without user_id, they belong to no one (admin/system)
	const outdatedCount = await Page.countDocuments({ schema_version: { $lt: SCHEMA_VERSION } });
	if (outdatedCount > 0) {
		await Page.updateMany(
			{ schema_version: { $lt: SCHEMA_VERSION } },
			{ $set: { user_id: null, schema_version: SCHEMA_VERSION } }
		);
		console.log(`[migrate] Upgraded ${outdatedCount} page(s) to schema v${SCHEMA_VERSION} (user_id)`);
	}

	// Seed default page only if no pages exist at all
	const count = await Page.countDocuments();
	if (count === 0) {
		await Page.create({ schema_version: SCHEMA_VERSION });
	}

	// Record migration
	const migrations = db.collection('page_migrations');
	await migrations.insertOne({
		schema_version: SCHEMA_VERSION,
		upgraded_docs: outdatedCount,
		user_count: await User.countDocuments(),
		ran_at: new Date().toISOString(),
	});

	console.log(`[migrate] Schema v${SCHEMA_VERSION} current — ${count} pages`);
}
