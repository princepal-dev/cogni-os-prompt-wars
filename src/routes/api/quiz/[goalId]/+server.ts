import { json, type RequestHandler } from '@sveltejs/kit';
import { QuizService } from '$lib/server/services/quiz.service';
import { dbStore } from '$lib/server/db/store';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	const quizzes = dbStore.getQuizzes(goalId);
	const attempts = dbStore.getQuizAttempts(goalId, locals.user.id);

	return json({ success: true, data: { quizzes, attempts } });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	try {
		const { mode } = await request.json();
		const quiz = QuizService.generateQuiz(goalId, locals.user.id, mode || 'CONCEPT');
		return json({ success: true, data: quiz });
	} catch (err: any) {
		return json({ success: false, error: { code: 'QUIZ_GEN_FAILED', message: err.message } }, { status: 500 });
	}
};
