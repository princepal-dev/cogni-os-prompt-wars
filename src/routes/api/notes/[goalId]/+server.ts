import { json, type RequestHandler } from '@sveltejs/kit';
import { NotesService } from '$lib/server/services/notes.service';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	const notes = NotesService.getNotes(goalId, locals.user.id);
	return json({ success: true, data: notes });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	try {
		const { id, title, markdownContent } = await request.json();
		const note = await NotesService.saveNote(locals.user.id, goalId, title, markdownContent, id);
		return json({ success: true, data: note });
	} catch (err: any) {
		return json({ success: false, error: { code: 'NOTE_SAVE_FAILED', message: err.message } }, { status: 500 });
	}
};
