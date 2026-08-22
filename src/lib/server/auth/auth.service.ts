// Complete Authentication and Session Management Service for CognitiveOS
// Direct Neon Auth & Neon PostgreSQL Integration

import crypto from 'node:crypto';
import type { RequestEvent } from '@sveltejs/kit';
import { dbStore } from '../db/store';
import { hashPassword, verifyPassword } from './password';
import { neonAuth } from './neon-auth';
import { NeonPostgresService } from '../db/neon-postgres';
import type { User, LearnerProfile } from '$lib/types/domain';

export const SESSION_COOKIE_NAME = 'cognitive_os_session';
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export class AuthService {
	// Register a new user with secure password hashing and persistence in Neon Postgres
	public static async register(name: string, email: string, password: string): Promise<{ user: User; sessionToken: string }> {
		const normalizedEmail = email.trim().toLowerCase();
		if (!name || name.trim().length < 2) {
			throw new Error('Name must be at least 2 characters long');
		}
		if (!normalizedEmail || !normalizedEmail.includes('@')) {
			throw new Error('Please enter a valid email address');
		}
		if (!password || password.length < 6) {
			throw new Error('Password must be at least 6 characters long');
		}

		// Check Neon Postgres first
		let existing = await NeonPostgresService.getUserByEmail(normalizedEmail);
		if (!existing) {
			existing = dbStore.getUserByEmail(normalizedEmail) || null;
		}
		if (existing) {
			throw new Error('An account with this email already exists');
		}

		const userId = crypto.randomUUID();
		const passwordHash = await hashPassword(password);
		const user: User = {
			id: userId,
			email: normalizedEmail,
			name: name.trim(),
			createdAt: new Date().toISOString()
		};

		await NeonPostgresService.saveUser(user, passwordHash);
		dbStore.createUser(user, passwordHash);

		// Create default profile
		const profile: LearnerProfile = {
			id: crypto.randomUUID(),
			userId: user.id,
			background: 'Developer learning computer science and domain skills',
			dailyStudyMinutes: 45,
			studyDaysPerWeek: 5,
			preferredModalities: ['VIDEOS', 'CODING', 'PRACTICE_PROBLEMS'],
			inferredSessionPace: 'BALANCED',
			preferredSessionDurationMin: 30,
			bestStudyTime: 'EVENING',
			streakDays: 1,
			lastActiveDate: new Date().toISOString().split('T')[0]
		};
		dbStore.saveProfile(profile);

		// Issue session
		const sessionToken = crypto.randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
		const session = {
			id: crypto.randomUUID(),
			userId: user.id,
			token: sessionToken,
			expiresAt,
			createdAt: new Date().toISOString()
		};
		await NeonPostgresService.saveSession(session);
		dbStore.createSession(session);

		return { user, sessionToken };
	}

	// Login with email and password (DB-first)
	public static async login(email: string, password: string): Promise<{ user: User; sessionToken: string }> {
		const normalizedEmail = email.trim().toLowerCase();
		
		// DB-first user lookup
		let user = await NeonPostgresService.getUserByEmail(normalizedEmail);
		if (!user) {
			user = dbStore.getUserByEmail(normalizedEmail) || null;
		}

		if (!user) {
			throw new Error('Invalid email or password');
		}

		let storedHash = await NeonPostgresService.getPasswordHash(user.id);
		if (!storedHash) {
			storedHash = dbStore.getPasswordHash(user.id) || null;
		}

		if (!storedHash) {
			throw new Error('Invalid email or password');
		}

		const isValid = await verifyPassword(password, storedHash);
		if (!isValid) {
			throw new Error('Invalid email or password');
		}

		// Keep in-memory cache synchronized with DB
		dbStore.createUser(user, storedHash);

		// Issue session
		const sessionToken = crypto.randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
		const session = {
			id: crypto.randomUUID(),
			userId: user.id,
			token: sessionToken,
			expiresAt,
			createdAt: new Date().toISOString()
		};
		await NeonPostgresService.saveSession(session);
		dbStore.createSession(session);

		return { user, sessionToken };
	}

	// Resolve user from cookies (supports standard session cookie or Neon Auth token) - DB First
	public static async getUserFromEvent(event: RequestEvent): Promise<User | null> {
		const sessionToken = event.cookies.get(SESSION_COOKIE_NAME);
		if (!sessionToken) {
			// Check Authorization header for Neon Auth token
			const authHeader = event.request.headers.get('Authorization');
			if (authHeader?.startsWith('Bearer ')) {
				const bearerToken = authHeader.substring(7);
				const neonUser = await neonAuth.verifyNeonToken(bearerToken);
				if (neonUser) {
					let user = await NeonPostgresService.getUserByEmail(neonUser.email);
					if (!user) {
						user = dbStore.getUserByEmail(neonUser.email) || null;
					}
					if (!user) {
						// Auto-provision user from Neon Auth into Postgres
						user = {
							id: neonUser.id || crypto.randomUUID(),
							email: neonUser.email,
							name: neonUser.name,
							createdAt: new Date().toISOString()
						};
						const randomHash = await hashPassword(crypto.randomUUID());
						await NeonPostgresService.saveUser(user, randomHash);
						dbStore.createUser(user, randomHash);
					}
					return user;
				}
			}
			return null;
		}

		let session = await NeonPostgresService.getSessionByToken(sessionToken);
		if (!session) {
			session = dbStore.getSessionByToken(sessionToken) || null;
		}

		if (!session) {
			return null;
		}

		let user = await NeonPostgresService.getUserById(session.userId);
		if (!user) {
			user = dbStore.getUserById(session.userId) || null;
		}

		return user || null;
	}

	// Set session cookie
	public static setSessionCookie(event: RequestEvent, sessionToken: string) {
		const isHttps = event.url.protocol === 'https:';
		event.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: isHttps,
			maxAge: SESSION_MAX_AGE_SECONDS
		});
	}

	// Invalidate session & clear cookie
	public static logout(event: RequestEvent) {
		const sessionToken = event.cookies.get(SESSION_COOKIE_NAME);
		if (sessionToken) {
			dbStore.deleteSession(sessionToken);
			NeonPostgresService.deleteSession(sessionToken);
		}
		event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	}

	// Request password reset token
	public static async requestPasswordReset(email: string): Promise<string | null> {
		const normalizedEmail = email.trim().toLowerCase();
		let user = dbStore.getUserByEmail(normalizedEmail);
		if (!user) {
			user = (await NeonPostgresService.getUserByEmail(normalizedEmail)) || undefined;
		}
		if (!user) {
			return null;
		}

		const token = crypto.randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
		dbStore.savePasswordResetToken(token, user.id, expiresAt);
		return token;
	}

	// Reset password using validated reset token
	public static async resetPassword(token: string, newPassword: string): Promise<boolean> {
		if (!newPassword || newPassword.length < 6) {
			throw new Error('Password must be at least 6 characters long');
		}

		const record = dbStore.getPasswordResetToken(token);
		if (!record) {
			throw new Error('Invalid or expired password reset link');
		}

		const newHash = await hashPassword(newPassword);
		dbStore.updateUserPassword(record.userId, newHash);
		const user = dbStore.getUserById(record.userId);
		if (user) {
			await NeonPostgresService.saveUser(user, newHash);
		}
		dbStore.deletePasswordResetToken(token);
		return true;
	}
}
