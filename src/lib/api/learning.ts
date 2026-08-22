import { apiRequest } from './client';
import type {
	LearningGoal,
	Roadmap,
	DailyPlan,
	KnowledgeConcept,
	KnowledgeState,
	KnowledgeTimelineEvent,
	DiagnosticQuestion,
	DiagnosticEvaluationResult,
	CreateGoalRequest
} from '$lib/types/domain';

export const learningApi = {
	getGoals: () => apiRequest<LearningGoal[]>('/api/goals'),

	getGoal: (goalId: string) => apiRequest<LearningGoal>(`/api/goals/${goalId}`),

	createGoal: (data: CreateGoalRequest) =>
		apiRequest<LearningGoal>('/api/goals', {
			method: 'POST',
			body: data
		}),

	generateDiagnostic: (topic: string) =>
		apiRequest<{ questions: DiagnosticQuestion[] }>('/api/diagnostic/generate', {
			method: 'POST',
			body: { topic }
		}),

	evaluateDiagnostic: (goalId: string, goalTitle: string, answers: { questionId: string; conceptName: string; selectedOptionIndex: number }[]) =>
		apiRequest<DiagnosticEvaluationResult>('/api/diagnostic/evaluate', {
			method: 'POST',
			body: { goalId, goalTitle, answers }
		}),

	getRoadmap: (goalId: string) => apiRequest<Roadmap>(`/api/roadmap/${goalId}`),

	adaptRoadmap: (goalId: string, detectedGap: string, reason: string) =>
		apiRequest<{ roadmap: Roadmap }>('/api/roadmap/' + goalId, {
			method: 'POST',
			body: { detectedGap, reason }
		}),

	getDailyPlan: (goalId: string) => apiRequest<DailyPlan>(`/api/daily-plan/${goalId}`),

	toggleDailyPlanItem: (goalId: string, itemId: string, status: 'PENDING' | 'COMPLETED') =>
		apiRequest<DailyPlan>(`/api/daily-plan/${goalId}`, {
			method: 'PATCH',
			body: { itemId, status }
		}),

	getKnowledgeStates: (goalId: string) =>
		apiRequest<{
			conceptsWithState: { concept: KnowledgeConcept; state: KnowledgeState }[];
			timelineEvents: KnowledgeTimelineEvent[];
			graph: { nodes: any[]; edges: any[] };
		}>(`/api/knowledge/${goalId}`),

	triggerMagicMoment: (goalId: string) =>
		apiRequest<{ roadmap: Roadmap; adaptiveEvent: any; updatedConceptState: any }>('/api/demo/magic-moment', {
			method: 'POST',
			body: { goalId }
		})
};
