import { json, type RequestHandler } from '@sveltejs/kit';
import { AuthService } from '$lib/server/auth/auth.service';

export const POST: RequestHandler = async (event) => {
	try {
		const { name, email, password } = await event.request.json();
		const { user, sessionToken } = await AuthService.register(name, email, password);
		AuthService.setSessionCookie(event, sessionToken);

		return json({
			success: true,
			data: { user }
		});
	} catch (err: any) {
		return json(
			{
				success: false,
				error: { code: 'REGISTRATION_FAILED', message: err.message || 'Registration failed' }
			},
			{ status: 400 }
		);
	}
};
