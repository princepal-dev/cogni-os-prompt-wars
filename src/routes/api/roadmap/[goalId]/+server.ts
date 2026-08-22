import { json, type RequestHandler } from '@sveltejs/kit';
import { RoadmapService } from '$lib/server/services/roadmap.service';
import { dbStore } from '$lib/server/db/store';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	const roadmap = await RoadmapService.getOrCreateRoadmap(goalId, locals.user.id);
	return json({ success: true, data: roadmap });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	try {
		const { detectedGap, reason } = await request.json();
		const result = RoadmapService.adaptRoadmap(goalId, locals.user.id, detectedGap || 'Recursion & DFS', reason || 'Dynamic re-planning triggered');
		return json({ success: true, data: result });
	} catch (err: any) {
		return json({ success: false, error: { code: 'ROADMAP_ADAPT_FAILED', message: err.message } }, { status: 500 });
	}
};
