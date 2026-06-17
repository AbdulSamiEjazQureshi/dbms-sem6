import { json } from '@sveltejs/kit';
import { User } from '$lib/server/models/User';
import { verifyPassword, signToken, setSessionCookie } from '$lib/server/auth';
import { getClient } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	try {
		await getClient();
		const { email, password } = await event.request.json();

		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		const valid = await verifyPassword(password, user.password_hash);
		if (!valid) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		const token = signToken(String(user._id));
		setSessionCookie(event, token);

		return json({
			user: { _id: String(user._id), email: user.email, name: user.name },
		});
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : 'Login failed' }, { status: 500 });
	}
};
