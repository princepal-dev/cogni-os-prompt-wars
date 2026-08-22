import type { LayoutServerLoad } from './$types';
import { dbStore } from '$lib/server/db/store';
import { GoalService } from '$lib/server/services/goal.service';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user || null;
	const profile = user ? dbStore.getProfile(user.id) : null;
	const goals = user ? GoalService.getUserGoals(user.id) : [];

	return {
		user,
		profile,
		goals,
		activeGoal: goals[0] || null
	};
};
