// Neon Serverless PostgreSQL / Embedded Client Resolver

import { dbStore } from './store';

export const isPostgresConfigured = (): boolean => {
	const url = process.env.DATABASE_URL;
	return !!url && (url.startsWith('postgres://') || url.startsWith('postgresql://'));
};

export const getDatabaseType = (): 'neon_postgres' | 'embedded_store' => {
	return isPostgresConfigured() ? 'neon_postgres' : 'embedded_store';
};

export { dbStore };
