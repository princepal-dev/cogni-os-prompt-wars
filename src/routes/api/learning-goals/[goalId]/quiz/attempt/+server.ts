import { json, type RequestHandler } from '@sveltejs/kit';
import { QuizService } from '$lib/server/services/quiz.service';
import { dbStore } from '$lib/server/db/store';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user || dbStore.getUserByEmail('alex@learner.com');
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const goalId = params.goalId as string;
		const { quizId, answers } = await request.json();
		const result = QuizService.submitQuizAttempt(quizId, goalId, user.id, answers);
		return json({ success: true, data: result });
	} catch (err: any) {
		return json({ success: false, error: { code: 'ATTEMPT_FAILED', message: err.message } }, { status: 500 });
	}
};
