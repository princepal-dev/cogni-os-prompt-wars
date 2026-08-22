import { apiRequest } from './client';
import type { User, LearnerProfile, LearningGoal } from '$lib/types/domain';

export const authApi = {
	register: (name: string, email: string, password: string) =>
		apiRequest<{ user: User; sessionToken: string }>('/api/auth/register', {
			method: 'POST',
			body: { name, email, password }
		}),

	login: (email: string, password: string) =>
		apiRequest<{ user: User; sessionToken: string }>('/api/auth/login', {
			method: 'POST',
			body: { email, password }
		}),

	logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),

	getMe: () => apiRequest<{ user: User; profile?: LearnerProfile; activeGoal?: LearningGoal }>('/api/auth/me'),

	forgotPassword: (email: string) =>
		apiRequest<{ message: string; devResetToken?: string }>('/api/auth/forgot-password', {
			method: 'POST',
			body: { email }
		}),

	resetPassword: (token: string, password: string) =>
		apiRequest<{ message: string }>('/api/auth/reset-password', {
			method: 'POST',
			body: { token, password }
		})
};
