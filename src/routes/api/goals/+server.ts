import { json, type RequestHandler } from '@sveltejs/kit';
import { GoalService } from '$lib/server/services/goal.service';
import { RoadmapService } from '$lib/server/services/roadmap.service';
import { DailyPlanService } from '$lib/server/services/daily-plan.service';
import { dbStore } from '$lib/server/db/store';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goals = GoalService.getUserGoals(locals.user.id);
	return json({ success: true, data: goals });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const payload = await request.json();
		const goal = await GoalService.createGoal(locals.user.id, payload);
		// Auto initialize roadmap & daily plan
		await RoadmapService.getOrCreateRoadmap(goal.id, locals.user.id);
		DailyPlanService.getOrCreateDailyPlan(goal.id, locals.user.id);

		return json({ success: true, data: goal });
	} catch (err: any) {
		return json({ success: false, error: { code: 'GOAL_CREATION_FAILED', message: err.message } }, { status: 400 });
	}
};
