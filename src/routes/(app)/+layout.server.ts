import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { GoalService } from '$lib/server/services/goal.service';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/login');
	}

	const userId = user.id;
	const goals = GoalService.getUserGoals(userId);
	const activeGoal = goals[0] || null;

	return {
		user,
		goals,
		activeGoal
	};
};
