import mongoose, { Schema, type Document, type Model, Types } from 'mongoose';

export interface IPageDesign extends Document {
	name: string;
	page_title: string;
	heading: string;
	content: string;
	font_family: string;
	heading_font: string;
	font_size: number;
	heading_size: number;
	font_weight: number;
	heading_weight: number;
	font_color: string;
	heading_color: string;
	line_height: number;
	letter_spacing: number;
	background_color: string;
	accent_color: string;
	link_color: string;
	padding: number;
	text_align: string;
	border_radius: number;
	max_width: number;
	button_text: string;
	button_bg: string;
	button_text_color: string;
	button_radius: number;
	button_padding_v: number;
	button_padding_h: number;
	button_full_width: boolean;
	show_button: boolean;
	user_id: Types.ObjectId | string | null;
	schema_version: number;
	created_at: string;
	updated_at: string;
}

const pageSchema = new Schema<IPageDesign>(
	{
		name: { type: String, required: true, default: 'Welcome Page', trim: true, maxlength: 200 },
		page_title: { type: String, default: 'My Page - Webuilder', trim: true, maxlength: 300 },
		heading: { type: String, default: 'Hello, World!', trim: true, maxlength: 500 },
		content: { type: String, default: 'This is a sample page created with the Web Builder. Customize fonts, colors, layout, and even add buttons — all changes update in real-time.', maxlength: 10000 },
		font_family: { type: String, default: 'Inter, sans-serif', trim: true, maxlength: 200 },
		heading_font: { type: String, default: 'DM Serif Display, Georgia, serif', trim: true, maxlength: 200 },
		font_size: { type: Number, default: 20, min: 1, max: 200 },
		heading_size: { type: Number, default: 48, min: 1, max: 300 },
		font_weight: { type: Number, default: 400, min: 100, max: 900 },
		heading_weight: { type: Number, default: 400, min: 100, max: 900 },
		font_color: { type: String, default: '#2c2c2c', trim: true, match: /^#[0-9a-fA-F]{6}$/ },
		heading_color: { type: String, default: '#2d5a3d', trim: true, match: /^#[0-9a-fA-F]{6}$/ },
		line_height: { type: Number, default: 1.7, min: 0.5, max: 5 },
		letter_spacing: { type: Number, default: 0, min: -10, max: 50 },
		background_color: { type: String, default: '#f7f3ee', trim: true, match: /^#[0-9a-fA-F]{6}$/ },
		accent_color: { type: String, default: '#7dab7d', trim: true, match: /^#[0-9a-fA-F]{6}$/ },
		link_color: { type: String, default: '#4a7c59', trim: true, match: /^#[0-9a-fA-F]{6}$/ },
		padding: { type: Number, default: 60, min: 0, max: 500 },
		text_align: { type: String, default: 'center', enum: ['left', 'center', 'right', 'justify'] },
		border_radius: { type: Number, default: 0, min: 0, max: 200 },
		max_width: { type: Number, default: 800, min: 200, max: 3000 },
		button_text: { type: String, default: 'Get Started', trim: true, maxlength: 200 },
		button_bg: { type: String, default: '#4a7c59', trim: true, match: /^#[0-9a-fA-F]{6}$/ },
		button_text_color: { type: String, default: '#ffffff', trim: true, match: /^#[0-9a-fA-F]{6}$/ },
		button_radius: { type: Number, default: 8, min: 0, max: 100 },
		button_padding_v: { type: Number, default: 14, min: 0, max: 100 },
		button_padding_h: { type: Number, default: 32, min: 0, max: 200 },
		button_full_width: { type: Boolean, default: false },
		show_button: { type: Boolean, default: true },
		user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
		schema_version: { type: Number, default: 2, min: 1 },
		created_at: { type: String, default: '' },
		updated_at: { type: String, default: '' },
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
		toJSON: {
			transform(_doc, ret) {
				ret._id = String(ret._id) as never;
				return ret;
			},
		},
	}
);

pageSchema.index({ updated_at: -1 });
pageSchema.index({ user_id: 1, updated_at: -1 });

export const Page: Model<IPageDesign> = mongoose.models.Page || mongoose.model<IPageDesign>('Page', pageSchema);
