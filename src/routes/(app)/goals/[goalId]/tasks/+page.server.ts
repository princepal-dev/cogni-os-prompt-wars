import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { dbStore } from '$lib/server/db/store';
import { TaskService } from '$lib/server/services/task.service';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/login');
	}

	const goalId = params.goalId;
	const goal = dbStore.getGoalById(goalId, user.id);
	if (!goal) {
		throw redirect(303, '/goals/new');
	}

	const tasks = TaskService.getTasks(goalId, user.id);

	return {
		goal,
		tasks
	};
};
