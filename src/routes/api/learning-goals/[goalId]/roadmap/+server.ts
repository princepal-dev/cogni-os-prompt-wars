import { json, type RequestHandler } from '@sveltejs/kit';
import { RoadmapService } from '$lib/server/services/roadmap.service';
import { dbStore } from '$lib/server/db/store';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user || dbStore.getUserByEmail('alex@learner.com');
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const goalId = params.goalId as string;
		const roadmap = await RoadmapService.getOrCreateRoadmap(goalId, user.id);
		return json({ success: true, data: roadmap });
	} catch (err: any) {
		return json({ success: false, error: { code: 'ROADMAP_ERROR', message: err.message } }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user || dbStore.getUserByEmail('alex@learner.com');
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const goalId = params.goalId as string;
		const { detectedGap, reason } = await request.json();
		const result = RoadmapService.adaptRoadmap(goalId, user.id, detectedGap || 'General Reinforcement', reason || 'Performance adjustment');
		return json({ success: true, data: result });
	} catch (err: any) {
		return json({ success: false, error: { code: 'ADAPTATION_FAILED', message: err.message } }, { status: 500 });
	}
};
