import { apiRequest } from './client';
import type { Flashcard } from '$lib/types/domain';

export const flashcardsApi = {
	getFlashcards: (goalId: string, filter?: 'due' | 'all') =>
		apiRequest<Flashcard[]>(`/api/flashcards/${goalId}${filter ? `?filter=${filter}` : ''}`),

	reviewCard: (goalId: string, flashcardId: string, rating: 1 | 2 | 3 | 4) =>
		apiRequest<Flashcard>(`/api/flashcards/${goalId}`, {
			method: 'POST',
			body: { flashcardId, rating }
		})
};
