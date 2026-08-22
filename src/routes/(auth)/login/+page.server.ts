import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AuthService } from '$lib/server/auth/auth.service';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/dashboard?login_success=true');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';

		if (!email.trim() || !password) {
			return fail(400, { message: 'Email and password are required' });
		}

		try {
			const { sessionToken } = await AuthService.login(email, password);
			AuthService.setSessionCookie(event, sessionToken);
		} catch (err: any) {
			return fail(400, { message: err.message || 'Invalid email or password' });
		}

		throw redirect(303, '/dashboard?login_success=true');
	}
};
