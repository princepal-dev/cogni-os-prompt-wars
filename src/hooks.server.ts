import type { Handle } from '@sveltejs/kit';
import { AuthService } from '$lib/server/auth/auth.service';

export const handle: Handle = async ({ event, resolve }) => {
	// Resolve active user strictly from valid session cookie or Neon Auth Authorization header
	const user = await AuthService.getUserFromEvent(event);
	event.locals.user = user;

	return resolve(event);
};
