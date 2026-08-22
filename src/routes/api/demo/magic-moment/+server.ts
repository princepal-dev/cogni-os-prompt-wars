import { json, type RequestHandler } from '@sveltejs/kit';
import { DemoService } from '$lib/server/services/demo.service';
import { dbStore } from '$lib/server/db/store';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		let { goalId } = await request.json().catch(() => ({ goalId: undefined }));
		if (!goalId) {
			const goals = dbStore.getGoals(user.id);
			if (goals.length > 0) {
				goalId = goals[0].id;
			} else {
				return json({ success: false, error: { code: 'NO_GOAL', message: 'Please create a learning goal first.' } }, { status: 400 });
			}
		}

		const result = DemoService.triggerMagicMoment(goalId, user.id);
		return json({ success: true, data: result });
	} catch (err: any) {
		return json({ success: false, error: { code: 'MAGIC_MOMENT_FAILED', message: err.message } }, { status: 500 });
	}
};
