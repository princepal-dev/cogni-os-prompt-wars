import { json, type RequestHandler } from '@sveltejs/kit';
import { AuthService } from '$lib/server/auth/auth.service';

export const POST: RequestHandler = async (event) => {
	AuthService.logout(event);
	return json({ success: true });
};
