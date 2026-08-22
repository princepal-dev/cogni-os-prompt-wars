import { json, type RequestHandler } from '@sveltejs/kit';
import { DemoService } from '$lib/server/services/demo.service';
import { GoalService } from '$lib/server/services/goal.service';
import { AuthService } from '$lib/server/auth/auth.service';
import { dbStore } from '$lib/server/db/store';

export const POST: RequestHandler = async ({ request, locals }) => {
	let user = locals.user;
	if (!user) {
		user = dbStore.getUserByEmail('alex@learner.com') || (await AuthService.ensureSeedUser());
	}

	try {
		let { goalId } = await request.json().catch(() => ({ goalId: undefined }));
		if (!goalId) {
			const goals = dbStore.getGoals(user.id);
			if (goals.length > 0) {
				goalId = goals[0].id;
			} else {
				const seeded = await GoalService.ensureSeedGoal(user);
				goalId = seeded.id;
			}
		}

		const result = DemoService.triggerMagicMoment(goalId, user.id);
		return json({ success: true, data: result });
	} catch (err: any) {
		return json({ success: false, error: { code: 'MAGIC_MOMENT_FAILED', message: err.message } }, { status: 500 });
	}
};
