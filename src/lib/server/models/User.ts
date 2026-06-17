import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IUser extends Document {
	email: string;
	name: string;
	password_hash: string;
	created_at: string;
	updated_at: string;
}

const userSchema = new Schema<IUser>(
	{
		email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 255 },
		name: { type: String, required: true, trim: true, maxlength: 100 },
		password_hash: { type: String, required: true },
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
		toJSON: {
			transform(_doc, ret) {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { password_hash, ...safe } = ret;
				safe._id = String(safe._id) as never;
				return safe;
			},
		},
	}
);

userSchema.index({ email: 1 });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
