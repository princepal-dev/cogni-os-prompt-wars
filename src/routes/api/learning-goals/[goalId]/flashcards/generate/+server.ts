import { json, type RequestHandler } from '@sveltejs/kit';
import { NotesService } from '$lib/server/services/notes.service';
import { FlashcardService } from '$lib/server/services/flashcard.service';
import { dbStore } from '$lib/server/db/store';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user || dbStore.getUserByEmail('alex@learner.com');
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const goalId = params.goalId as string;
		const { noteId } = await request.json().catch(() => ({ noteId: undefined }));

		let cards;
		if (noteId) {
			cards = await NotesService.generateFlashcardsFromNote(noteId, user.id);
		} else {
			cards = FlashcardService.getAllFlashcards(goalId, user.id);
		}

		return json({ success: true, data: cards });
	} catch (err: any) {
		return json({ success: false, error: { code: 'FLASHCARD_GEN_FAILED', message: err.message } }, { status: 500 });
	}
};
