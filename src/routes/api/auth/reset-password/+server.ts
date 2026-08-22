import { json, type RequestHandler } from '@sveltejs/kit';
import { AuthService } from '$lib/server/auth/auth.service';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { token, password } = await request.json();
		if (!token) {
			return json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Reset token is required' } }, { status: 400 });
		}
		if (!password || password.length < 6) {
			return json({ success: false, error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters' } }, { status: 400 });
		}

		await AuthService.resetPassword(token, password);
		return json({
			success: true,
			data: { message: 'Password successfully reset. You can now log in.' }
		});
	} catch (err: any) {
		return json({ success: false, error: { code: 'RESET_FAILED', message: err.message } }, { status: 400 });
	}
};
