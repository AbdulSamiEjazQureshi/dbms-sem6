import { getSessionToken, verifyToken } from '$lib/server/auth';
import { User } from '$lib/server/models/User';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = getSessionToken(event);
	if (token) {
		const payload = verifyToken(token);
		if (payload) {
			try {
				const user = await User.findById(payload.userId).lean();
				if (user) {
					event.locals.user = {
						_id: String(user._id),
						email: user.email,
						name: user.name,
					};
				}
			} catch {
				// DB not ready yet — treat as unauthenticated
			}
		}
	}
	return resolve(event);
};
