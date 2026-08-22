import { json, type RequestHandler } from '@sveltejs/kit';
import { TaskService } from '$lib/server/services/task.service';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId as string;
	const tasks = TaskService.getTasks(goalId, user.id);
	return json({ success: true, data: tasks });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const goalId = params.goalId as string;
		const payload = await request.json();
		const task = TaskService.createTask(goalId, user.id, payload);
		return json({ success: true, data: task });
	} catch (err: any) {
		return json({ success: false, error: { code: 'TASK_CREATE_FAILED', message: err.message } }, { status: 400 });
	}
};
