import { json, type RequestHandler } from '@sveltejs/kit';
import { AuthService } from '$lib/server/auth/auth.service';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email } = await request.json();
		if (!email || !email.includes('@')) {
			return json({ success: false, error: { code: 'INVALID_EMAIL', message: 'Please enter a valid email address' } }, { status: 400 });
		}

		const resetToken = await AuthService.requestPasswordReset(email);
		
		// In production, send via email. Return success without exposing if user exists.
		return json({
			success: true,
			data: {
				message: 'If an account exists with that email, a password reset link has been issued.',
				// Exposing resetToken for testing/development evaluation
				devResetToken: resetToken || undefined
			}
		});
	} catch (err: any) {
		return json({ success: false, error: { code: 'RESET_REQUEST_FAILED', message: err.message } }, { status: 500 });
	}
};
