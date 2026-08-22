import { apiRequest } from './client';
import type { Quiz, QuizAttempt, TeachBackSession } from '$lib/types/domain';

export const quizApi = {
	getQuiz: (goalId: string, mode = 'CONCEPT') =>
		apiRequest<Quiz>(`/api/quiz/${goalId}?mode=${mode}`),

	submitAttempt: (quizId: string, goalId: string, answers: { questionId: string; selectedOptionIndex: number }[]) =>
		apiRequest<QuizAttempt>('/api/quiz/attempt', {
			method: 'POST',
			body: { quizId, goalId, answers }
		}),

	submitTeachBack: (goalId: string, conceptName: string, promptScenario: string, userExplanation: string) =>
		apiRequest<TeachBackSession>('/api/teach-back/submit', {
			method: 'POST',
			body: { goalId, conceptName, promptScenario, userExplanation }
		})
};
