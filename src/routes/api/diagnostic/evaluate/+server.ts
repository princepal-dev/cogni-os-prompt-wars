import { json, type RequestHandler } from '@sveltejs/kit';
import { AIService } from '$lib/server/ai/ai.service';
import { KnowledgeService } from '$lib/server/services/knowledge.service';
import { dbStore } from '$lib/server/db/store';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const { goalTitle, answers, goalId } = await request.json();
		const result = await AIService.evaluateDiagnostic(goalTitle || 'Graph Algorithms', answers || []);

		// If goalId is provided, apply initial states directly
		if (goalId) {
			for (const c of result.conceptStates) {
				KnowledgeService.updateConceptState(
					goalId,
					locals.user.id,
					c.conceptName,
					c.score,
					'DIAGNOSTIC',
					`Diagnostic baseline assessment: ${c.reason}`,
					c.state as any
				);
			}
		}

		return json({ success: true, data: result });
	} catch (err: any) {
		return json({ success: false, error: { code: 'DIAGNOSTIC_EVAL_FAILED', message: err.message } }, { status: 500 });
	}
};
