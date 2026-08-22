import { json, type RequestHandler } from '@sveltejs/kit';
import { TaskService } from '$lib/server/services/task.service';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	const tasks = TaskService.getTasks(goalId, locals.user.id);
	return json({ success: true, data: tasks });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId!;
	try {
		const payload = await request.json();
		const task = TaskService.createTask(goalId, locals.user.id, payload);
		return json({ success: true, data: task });
	} catch (err: any) {
		return json({ success: false, error: { code: 'TASK_CREATE_FAILED', message: err.message } }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const { taskId, status } = await request.json();
		const task = TaskService.updateTaskStatus(taskId, locals.user.id, status);
		return json({ success: true, data: task });
	} catch (err: any) {
		return json({ success: false, error: { code: 'TASK_UPDATE_FAILED', message: err.message } }, { status: 500 });
	}
};
