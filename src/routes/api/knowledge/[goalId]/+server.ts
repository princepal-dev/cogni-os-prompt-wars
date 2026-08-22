import { json, type RequestHandler } from '@sveltejs/kit';
import { KnowledgeService } from '$lib/server/services/knowledge.service';
import { dbStore } from '$lib/server/db/store';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	const conceptsWithState = KnowledgeService.getConceptStates(goalId, locals.user.id);
	const graph = KnowledgeService.getKnowledgeGraph(goalId, locals.user.id);
	const timeline = dbStore.getTimelineEvents(goalId, locals.user.id);

	return json({
		success: true,
		data: {
			concepts: conceptsWithState,
			graph,
			timeline
		}
	});
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	try {
		const { conceptName, scoreDelta, reason, overrideState } = await request.json();
		const updated = KnowledgeService.updateConceptState(
			goalId,
			locals.user.id,
			conceptName,
			scoreDelta ?? 0,
			'MANUAL',
			reason || 'Manual calibration',
			overrideState
		);
		return json({ success: true, data: updated });
	} catch (err: any) {
		return json({ success: false, error: { code: 'KNOWLEDGE_UPDATE_FAILED', message: err.message } }, { status: 500 });
	}
};
