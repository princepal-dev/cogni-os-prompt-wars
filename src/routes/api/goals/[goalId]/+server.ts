import { json, type RequestHandler } from '@sveltejs/kit';
import { dbStore } from '$lib/server/db/store';
import { KnowledgeService } from '$lib/server/services/knowledge.service';
import { RoadmapService } from '$lib/server/services/roadmap.service';
import { DailyPlanService } from '$lib/server/services/daily-plan.service';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	const goal = dbStore.getGoalById(goalId, locals.user.id);
	if (!goal) {
		return json({ success: false, error: { code: 'NOT_FOUND', message: 'Learning goal not found' } }, { status: 404 });
	}

	const conceptsWithState = KnowledgeService.getConceptStates(goalId, locals.user.id);
	const roadmap = await RoadmapService.getOrCreateRoadmap(goalId, locals.user.id);
	const dailyPlan = DailyPlanService.getOrCreateDailyPlan(goalId, locals.user.id);

	return json({
		success: true,
		data: {
			goal,
			conceptsWithState,
			roadmap,
			dailyPlan
		}
	});
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	const deleted = dbStore.deleteGoal(goalId, locals.user.id);
	return json({ success: deleted });
};
