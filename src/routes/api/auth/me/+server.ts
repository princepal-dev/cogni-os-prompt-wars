import { json, type RequestHandler } from '@sveltejs/kit';
import { AuthService } from '$lib/server/auth/auth.service';
import { dbStore } from '$lib/server/db/store';

export const POST: RequestHandler = async (event) => {
	AuthService.logout(event);
	return json({ success: true });
};

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const profile = dbStore.getProfile(locals.user.id);
	const goals = dbStore.getGoals(locals.user.id);

	return json({
		success: true,
		data: {
			user: locals.user,
			profile,
			activeGoal: goals[0] || null
		}
	});
};
