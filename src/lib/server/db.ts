import mongoose from 'mongoose';
import { MONGODB_URI } from '$env/static/private';
import { Page, type IPageDesign } from './models/Page';
import { runMigrations } from './migrate';

export async function getClient(): Promise<typeof mongoose> {
	if (mongoose.connection.readyState !== 1) {
		try {
			await mongoose.connect(MONGODB_URI);
		} catch (e) {
			throw new Error(
				`Failed to connect to MongoDB at ${MONGODB_URI}. Make sure MongoDB is running.`
			);
		}
		try {
			await runMigrations();
		} catch (e) {
			throw new Error(
				`Connected to MongoDB but migration failed: ${e instanceof Error ? e.message : e}`
			);
		}
	}
	return mongoose;
}

export function getDbName(): string {
	return 'dbms_webuilder';
}

export type PageDocument = IPageDesign;

export async function initDatabase(): Promise<void> {
	await getClient();
}


export async function listPages(): Promise<IPageDesign[]> {
	await getClient();
	const docs = await Page.find().sort({ updated_at: -1 }).lean({ virtuals: true });
	return docs.map((d) => ({
		...d,
		_id: String(d._id),
	})) as unknown as IPageDesign[];
}

export async function getPage(id: string): Promise<IPageDesign | null> {
	await getClient();
	const doc = await Page.findById(id).lean({ virtuals: true });
	if (!doc) return null;
	return { ...doc, _id: String(doc._id) } as unknown as IPageDesign;
}

export async function createPage(data: Partial<IPageDesign>): Promise<IPageDesign> {
	await getClient();
	const { _id, ...cleanData } = data;
	const doc = await Page.create(cleanData);
	return JSON.parse(JSON.stringify(doc.toJSON()));
}

export async function updatePage(id: string, data: Partial<IPageDesign>): Promise<IPageDesign | null> {
	await getClient();
	const { _id, ...cleanData } = data;
	const doc = await Page.findByIdAndUpdate(id, { $set: cleanData }, { new: true, runValidators: true });
	if (!doc) return null;
	return JSON.parse(JSON.stringify(doc.toJSON()));
}

export async function deletePage(id: string): Promise<boolean> {
	await getClient();
	const result = await Page.findByIdAndDelete(id);
	return result !== null;
}
