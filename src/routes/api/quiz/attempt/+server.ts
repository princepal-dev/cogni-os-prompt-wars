import { json, type RequestHandler } from '@sveltejs/kit';
import { QuizService } from '$lib/server/services/quiz.service';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const { quizId, goalId, answers } = await request.json();
		const attempt = QuizService.submitQuizAttempt(quizId, goalId, locals.user.id, answers || []);
		return json({ success: true, data: attempt });
	} catch (err: any) {
		return json({ success: false, error: { code: 'QUIZ_SUBMIT_FAILED', message: err.message } }, { status: 500 });
	}
};
