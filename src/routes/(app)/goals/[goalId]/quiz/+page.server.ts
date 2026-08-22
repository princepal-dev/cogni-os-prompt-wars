import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { dbStore } from '$lib/server/db/store';
import { QuizService } from '$lib/server/services/quiz.service';

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

	const quiz = QuizService.generateQuiz(goalId, user.id, 'CONCEPT');
	const pastAttempts = dbStore.getQuizAttempts(goalId, user.id);

	return {
		goal,
		quiz,
		pastAttempts
	};
};
