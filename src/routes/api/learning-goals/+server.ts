import { json, type RequestHandler } from '@sveltejs/kit';
import { GoalService } from '$lib/server/services/goal.service';
import { RoadmapService } from '$lib/server/services/roadmap.service';
import { DailyPlanService } from '$lib/server/services/daily-plan.service';
import { dbStore } from '$lib/server/db/store';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user || dbStore.getUserByEmail('alex@learner.com');
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goals = GoalService.getUserGoals(user.id);
	return json({ success: true, data: goals });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user || dbStore.getUserByEmail('alex@learner.com');
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const payload = await request.json();
		const goal = await GoalService.createGoal(user.id, payload);
		await RoadmapService.getOrCreateRoadmap(goal.id, user.id);
		DailyPlanService.getOrCreateDailyPlan(goal.id, user.id);

		return json({ success: true, data: goal });
	} catch (err: any) {
		return json({ success: false, error: { code: 'GOAL_CREATION_FAILED', message: err.message } }, { status: 400 });
	}
};
