import { json, type RequestHandler } from '@sveltejs/kit';
import { getDatabaseType } from '$lib/server/db/client';
import { openRouterProvider } from '$lib/server/ai/openrouter.provider';

export const GET: RequestHandler = async () => {
	return json({
		status: 'ok',
		system: 'CognitiveOS',
		version: '1.0.0',
		timestamp: new Date().toISOString(),
		database: getDatabaseType(),
		openRouterConfigured: openRouterProvider.isAvailable(),
		uptimeSeconds: Math.round(process.uptime())
	});
};
