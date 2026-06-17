import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';

const TOKEN_COOKIE = 'session';
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export function signToken(userId: string): string {
	return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
		return decoded;
	} catch {
		return null;
	}
}

export function setSessionCookie(event: RequestEvent, token: string): void {
	event.cookies.set(TOKEN_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false, // set true in production with HTTPS
		maxAge: 7 * 24 * 60 * 60, // 7 days
	});
}

export function clearSessionCookie(event: RequestEvent): void {
	event.cookies.delete(TOKEN_COOKIE, { path: '/' });
}

export function getSessionToken(event: RequestEvent): string | null {
	return event.cookies.get(TOKEN_COOKIE) ?? null;
}
