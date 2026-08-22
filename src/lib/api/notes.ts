import { apiRequest } from './client';
import type { Note, Flashcard } from '$lib/types/domain';

export const notesApi = {
	getNotes: (goalId: string) => apiRequest<Note[]>(`/api/notes/${goalId}`),

	saveNote: (goalId: string, title: string, markdownContent: string, id?: string) =>
		apiRequest<Note>(`/api/notes/${goalId}`, {
			method: 'POST',
			body: { id, title, markdownContent }
		}),

	generateFlashcardsFromNote: (goalId: string, noteId: string) =>
		apiRequest<Flashcard[]>(`/api/learning-goals/${goalId}/flashcards/generate`, {
			method: 'POST',
			body: { noteId }
		})
};
