import { json, type RequestHandler } from '@sveltejs/kit';
import { DailyPlanService } from '$lib/server/services/daily-plan.service';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	const plan = DailyPlanService.getOrCreateDailyPlan(goalId, locals.user.id);
	return json({ success: true, data: plan });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	try {
		const { itemId, completed } = await request.json();
		const plan = DailyPlanService.toggleItemStatus(goalId, locals.user.id, itemId, completed);
		return json({ success: true, data: plan });
	} catch (err: any) {
		return json({ success: false, error: { code: 'DAILY_PLAN_UPDATE_FAILED', message: err.message } }, { status: 500 });
	}
};
