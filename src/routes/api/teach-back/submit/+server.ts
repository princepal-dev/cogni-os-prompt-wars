import { json, type RequestHandler } from '@sveltejs/kit';
import { TeachBackService } from '$lib/server/services/teach-back.service';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const payload = await request.json();
		const session = await TeachBackService.evaluateTeachBack(locals.user.id, payload);
		return json({ success: true, data: session });
	} catch (err: any) {
		return json({ success: false, error: { code: 'TEACH_BACK_EVAL_FAILED', message: err.message } }, { status: 500 });
	}
};
