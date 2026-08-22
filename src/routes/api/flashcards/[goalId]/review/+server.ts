import { json, type RequestHandler } from '@sveltejs/kit';
import { FlashcardService } from '$lib/server/services/flashcard.service';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const { flashcardId, rating } = await request.json();
		if (!flashcardId || !rating) {
			return json({ success: false, error: { code: 'INVALID_INPUT', message: 'flashcardId and rating are required' } }, { status: 400 });
		}

		const card = FlashcardService.reviewCard(flashcardId, user.id, rating);
		return json({ success: true, data: card });
	} catch (err: any) {
		return json({ success: false, error: { code: 'REVIEW_FAILED', message: err.message } }, { status: 500 });
	}
};
