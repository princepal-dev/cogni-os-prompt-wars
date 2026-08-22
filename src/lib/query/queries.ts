import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';

export const queryKeys = {
	aiStatus: ['ai', 'status'] as const,
	goals: ['goals'] as const,
	goalDetail: (goalId: string) => ['goals', goalId] as const,
	roadmap: (goalId: string) => ['roadmap', goalId] as const,
	dailyPlan: (goalId: string) => ['daily-plan', goalId] as const,
	knowledge: (goalId: string) => ['knowledge', goalId] as const,
	notes: (goalId: string) => ['notes', goalId] as const,
	tasks: (goalId: string) => ['tasks', goalId] as const,
	flashcards: (goalId: string) => ['flashcards', goalId] as const,
	inbox: ['inbox'] as const
};

// AI Status Query
export function createAiStatusQuery() {
	return createQuery(() => ({
		queryKey: queryKeys.aiStatus,
		queryFn: async () => {
			const res = await fetch('/api/ai/status');
			const json = await res.json();
			return json.data as {
				agentName: string;
				isOnline: boolean;
				model: string;
				offlineMessage: string;
			};
		}
	}));
}

// Daily Plan Query
export function createDailyPlanQuery(getGoalId: () => string) {
	return createQuery(() => ({
		queryKey: queryKeys.dailyPlan(getGoalId()),
		queryFn: async () => {
			const res = await fetch(`/api/daily-plan/${getGoalId()}`);
			const json = await res.json();
			return json.data;
		},
		enabled: !!getGoalId()
	}));
}

// Knowledge States Query
export function createKnowledgeQuery(getGoalId: () => string) {
	return createQuery(() => ({
		queryKey: queryKeys.knowledge(getGoalId()),
		queryFn: async () => {
			const res = await fetch(`/api/knowledge/${getGoalId()}`);
			const json = await res.json();
			return json.data;
		},
		enabled: !!getGoalId()
	}));
}
