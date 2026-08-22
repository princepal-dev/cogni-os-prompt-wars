// Cryptographically secure password hashing using Web Crypto PBKDF2

import crypto from 'node:crypto';

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.randomBytes(16).toString('hex');
	return new Promise((resolve, reject) => {
		crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
			if (err) reject(err);
			resolve(`${salt}:${derivedKey.toString('hex')}`);
		});
	});
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [salt, key] = storedHash.split(':');
	if (!salt || !key) return false;

	return new Promise((resolve, reject) => {
		crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
			if (err) reject(err);
			const isMatch = crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
			resolve(isMatch);
		});
	});
}
