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

		const existing = dbStore.getUserByEmail(normalizedEmail);
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

		dbStore.createUser(user, passwordHash);
		await NeonPostgresService.saveUser(user, passwordHash);

		// Create default profile
		const profile: LearnerProfile = {
			id: crypto.randomUUID(),
			userId: user.id,
			background: 'Developer preparing for technical interviews and learning computer science concepts',
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
		dbStore.createSession(session);
		await NeonPostgresService.saveSession(session);

		return { user, sessionToken };
	}

	// Login with email and password
	public static async login(email: string, password: string): Promise<{ user: User; sessionToken: string }> {
		const normalizedEmail = email.trim().toLowerCase();
		const user = dbStore.getUserByEmail(normalizedEmail);
		if (!user) {
			throw new Error('Invalid email or password');
		}

		const storedHash = dbStore.getPasswordHash(user.id);
		if (!storedHash) {
			throw new Error('Invalid email or password');
		}

		const isValid = await verifyPassword(password, storedHash);
		if (!isValid) {
			throw new Error('Invalid email or password');
		}

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
		dbStore.createSession(session);
		await NeonPostgresService.saveSession(session);

		return { user, sessionToken };
	}

	// Resolve user from cookies (supports standard session cookie or Neon Auth token)
	public static async getUserFromEvent(event: RequestEvent): Promise<User | null> {
		const sessionToken = event.cookies.get(SESSION_COOKIE_NAME);
		if (!sessionToken) {
			// Check Authorization header for Neon Auth token
			const authHeader = event.request.headers.get('Authorization');
			if (authHeader?.startsWith('Bearer ')) {
				const bearerToken = authHeader.substring(7);
				const neonUser = await neonAuth.verifyNeonToken(bearerToken);
				if (neonUser) {
					let user = dbStore.getUserByEmail(neonUser.email);
					if (!user) {
						// Auto-provision user from Neon Auth
						user = {
							id: neonUser.id || crypto.randomUUID(),
							email: neonUser.email,
							name: neonUser.name,
							createdAt: new Date().toISOString()
						};
						const randomHash = await hashPassword(crypto.randomUUID());
						dbStore.createUser(user, randomHash);
						await NeonPostgresService.saveUser(user, randomHash);
					}
					return user;
				}
			}
			return null;
		}

		const session = dbStore.getSessionByToken(sessionToken);
		if (!session) {
			return null;
		}

		const user = dbStore.getUserById(session.userId);
		return user || null;
	}

	// Set session cookie
	public static setSessionCookie(event: RequestEvent, sessionToken: string) {
		event.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
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
		const user = dbStore.getUserByEmail(normalizedEmail);
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
		dbStore.deletePasswordResetToken(token);
		return true;
	}

	// Ensure demo evaluation account exists in memory and Neon PostgreSQL
	public static async ensureSeedUser(): Promise<User> {
		const demoEmail = 'alex@learner.com';
		const existing = dbStore.getUserByEmail(demoEmail);
		if (existing) return existing;

		const { user } = await AuthService.register('Alex Learner', demoEmail, 'password123');
		return user;
	}
}
