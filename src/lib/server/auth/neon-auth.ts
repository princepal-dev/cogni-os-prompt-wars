// Neon Auth Integration Helper
// Supports Neon Auth projects, JWT inspection, and user synchronization with Neon PostgreSQL

export interface NeonAuthUser {
	id: string;
	email: string;
	name: string;
}

export class NeonAuthService {
	private authUrl: string;
	private projectId: string;

	constructor() {
		this.authUrl = process.env.NEON_AUTH_URL || '';
		this.projectId = process.env.NEON_AUTH_PROJECT_ID || '';
	}

	public isConfigured(): boolean {
		return !!this.authUrl || !!this.projectId;
	}

	public async verifyNeonToken(token: string): Promise<NeonAuthUser | null> {
		if (!this.isConfigured()) {
			return null;
		}

		try {
			// When configured with Neon Auth endpoint, verify against the Neon Auth API
			const res = await fetch(`${this.authUrl}/auth/v1/user`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!res.ok) return null;
			const data = (await res.json()) as any;
			return {
				id: data.id || data.sub,
				email: data.email,
				name: data.user_metadata?.name || data.email.split('@')[0]
			};
		} catch (err) {
			console.warn('Neon Auth verification error:', err);
			return null;
		}
	}
}

export const neonAuth = new NeonAuthService();
