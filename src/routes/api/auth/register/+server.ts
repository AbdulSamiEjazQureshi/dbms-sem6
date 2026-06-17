import { json } from '@sveltejs/kit';
import { User } from '$lib/server/models/User';
import { hashPassword, signToken, setSessionCookie } from '$lib/server/auth';
import { getClient } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	try {
		await getClient();
		const { email, name, password } = await event.request.json();

		if (!email || !name || !password) {
			return json({ error: 'Email, name, and password are required' }, { status: 400 });
		}
		if (password.length < 6) {
			return json({ error: 'Password must be at least 6 characters' }, { status: 400 });
		}

		const existing = await User.findOne({ email });
		if (existing) {
			return json({ error: 'Email already registered' }, { status: 409 });
		}

		const password_hash = await hashPassword(password);
		const user = await User.create({ email, name, password_hash });

		const token = signToken(String(user._id));
		setSessionCookie(event, token);

		return json({
			user: { _id: String(user._id), email: user.email, name: user.name },
		}, { status: 201 });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : 'Registration failed' }, { status: 500 });
	}
};
