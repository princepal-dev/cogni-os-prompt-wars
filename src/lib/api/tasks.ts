import { apiRequest } from './client';
import type { Task } from '$lib/types/domain';

export const tasksApi = {
	getTasks: (goalId: string) => apiRequest<Task[]>(`/api/tasks/${goalId}`),

	createTask: (
		goalId: string,
		data: {
			title: string;
			description: string;
			conceptName?: string;
			estimatedMinutes?: number;
			type?: 'LEARN' | 'PRACTICE' | 'REVIEW' | 'QUIZ' | 'FLASHCARD';
			priority?: 'LOW' | 'MEDIUM' | 'HIGH';
			whyReason?: string;
		}
	) =>
		apiRequest<Task>(`/api/tasks/${goalId}`, {
			method: 'POST',
			body: data
		}),

	updateTaskStatus: (goalId: string, taskId: string, status: string) =>
		apiRequest<Task>(`/api/tasks/${goalId}`, {
			method: 'PATCH',
			body: { taskId, status }
		})
};
