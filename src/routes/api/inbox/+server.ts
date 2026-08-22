import { json, type RequestHandler } from '@sveltejs/kit';
import { InboxService } from '$lib/server/services/inbox.service';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const items = InboxService.getInbox(locals.user.id);
	return json({ success: true, data: items });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const payload = await request.json();
		const item = InboxService.capture(locals.user.id, payload);
		return json({ success: true, data: item });
	} catch (err: any) {
		return json({ success: false, error: { code: 'INBOX_CAPTURE_FAILED', message: err.message } }, { status: 500 });
	}
};
