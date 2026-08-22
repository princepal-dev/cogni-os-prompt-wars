import { json, type RequestHandler } from '@sveltejs/kit';
import { KnowledgeService } from '$lib/server/services/knowledge.service';
import { dbStore } from '$lib/server/db/store';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId as string;
	const states = KnowledgeService.getConceptStates(goalId, user.id);
	const timeline = dbStore.getTimelineEvents(goalId, user.id);
	const graph = KnowledgeService.getKnowledgeGraph(goalId, user.id);

	return json({
		success: true,
		data: {
			conceptsWithState: states,
			timelineEvents: timeline,
			graph
		}
	});
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const goalId = params.goalId as string;
		const { conceptName, delta, triggerType, reason, overrideState } = await request.json();
		const updated = KnowledgeService.updateConceptState(
			goalId,
			user.id,
			conceptName,
			delta ?? 0,
			triggerType ?? 'MANUAL',
			reason ?? 'Manual knowledge assessment update',
			overrideState
		);

		return json({ success: true, data: updated });
	} catch (err: any) {
		return json({ success: false, error: { code: 'KNOWLEDGE_UPDATE_FAILED', message: err.message } }, { status: 400 });
	}
};
