import { json, type RequestHandler } from '@sveltejs/kit';
import { NotesService } from '$lib/server/services/notes.service';
import { dbStore } from '$lib/server/db/store';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user || dbStore.getUserByEmail('alex@learner.com');
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId as string;
	const notes = NotesService.getNotes(goalId, user.id);
	return json({ success: true, data: notes });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user || dbStore.getUserByEmail('alex@learner.com');
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const goalId = params.goalId as string;
		const { id, title, markdownContent } = await request.json();
		const note = await NotesService.saveNote(user.id, goalId, title, markdownContent, id);
		return json({ success: true, data: note });
	} catch (err: any) {
		return json({ success: false, error: { code: 'NOTE_SAVE_FAILED', message: err.message } }, { status: 400 });
	}
};
