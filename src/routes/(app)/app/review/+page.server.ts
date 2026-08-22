import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { dbStore } from '$lib/server/db/store';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user || dbStore.getUserByEmail('alex@learner.com');
	const goals = user ? dbStore.getGoals(user.id) : [];
	const goalId = goals[0]?.id || 'demo-alex';
	throw redirect(307, `/goals/${goalId}/flashcards`);
};
