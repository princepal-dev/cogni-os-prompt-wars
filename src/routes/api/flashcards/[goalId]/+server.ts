import { json, type RequestHandler } from '@sveltejs/kit';
import { FlashcardService } from '$lib/server/services/flashcard.service';

export const GET: RequestHandler = async ({ params, url, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	const dueOnly = url.searchParams.get('due') === 'true';

	const cards = dueOnly
		? FlashcardService.getDueFlashcards(goalId, locals.user.id)
		: FlashcardService.getAllFlashcards(goalId, locals.user.id);

	return json({ success: true, data: cards });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const { flashcardId, rating } = await request.json();
		const updated = FlashcardService.reviewCard(flashcardId, locals.user.id, rating);
		return json({ success: true, data: updated });
	} catch (err: any) {
		return json({ success: false, error: { code: 'FLASHCARD_REVIEW_FAILED', message: err.message } }, { status: 500 });
	}
};
