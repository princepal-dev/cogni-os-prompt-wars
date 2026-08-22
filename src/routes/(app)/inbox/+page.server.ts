import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { InboxService } from '$lib/server/services/inbox.service';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/login');
	}

	const items = InboxService.getInbox(user.id);

	return {
		items
	};
};
