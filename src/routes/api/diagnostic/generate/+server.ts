import { json, type RequestHandler } from '@sveltejs/kit';
import { AIService } from '$lib/server/ai/ai.service';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const { topic } = await request.json();
		const questions = await AIService.generateDiagnostic(topic || 'Graph Algorithms in DSA');
		return json({ success: true, data: { questions } });
	} catch (err: any) {
		return json({ success: false, error: { code: 'DIAGNOSTIC_GEN_FAILED', message: err.message } }, { status: 500 });
	}
};
