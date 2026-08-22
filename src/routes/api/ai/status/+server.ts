import { json, type RequestHandler } from '@sveltejs/kit';
import { AIService } from '$lib/server/ai/ai.service';

export const GET: RequestHandler = async () => {
	const status = AIService.getAgentStatus();
	return json({
		success: true,
		data: status
	});
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	if (body.apiKey && typeof body.apiKey === 'string') {
		process.env.OPENROUTER_API_KEY = body.apiKey.trim();
	}
	if (body.model && typeof body.model === 'string') {
		process.env.OPENROUTER_MODEL = body.model.trim();
	}

	const status = AIService.getAgentStatus();
	return json({
		success: true,
		data: status
	});
};
