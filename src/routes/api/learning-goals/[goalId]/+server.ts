import { json, type RequestHandler } from '@sveltejs/kit';
import { dbStore } from '$lib/server/db/store';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId as string;
	const goal = dbStore.getGoalById(goalId, user.id);
	if (!goal) {
		return json({ success: false, error: { code: 'NOT_FOUND', message: 'Learning goal not found' } }, { status: 404 });
	}

	return json({ success: true, data: goal });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId as string;
	const deleted = dbStore.deleteGoal(goalId, user.id);
	return json({ success: deleted });
};
