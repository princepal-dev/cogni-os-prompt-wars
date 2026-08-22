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
		const { mode = 'CONCEPT' } = await request.json().catch(() => ({ mode: 'CONCEPT' }));
		const quiz = QuizService.generateQuiz(goalId, user.id, mode);
		return json({ success: true, data: quiz });
	} catch (err: any) {
		return json({ success: false, error: { code: 'QUIZ_GEN_FAILED', message: err.message } }, { status: 500 });
	}
};
