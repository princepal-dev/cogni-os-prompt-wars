// API Request and Response Types for CognitiveOS

import type {
	LearningGoal,
	KnowledgeState,
	KnowledgeConcept,
	Roadmap,
	DailyPlan,
	Task,
	Note,
	InboxItem,
	LearningQuestion,
	Quiz,
	QuizAttempt,
	Flashcard,
	TeachBackSession,
	CuratedResource,
	KnowledgeTimelineEvent,
	AdaptiveEvent,
	User,
	LearnerProfile,
	ModalityPreference,
	GoalMotivationType
} from './domain';

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: {
		code: string;
		message: string;
		details?: unknown;
	};
}

// Auth DTOs
export interface AuthUserResponse {
	user: User;
	profile?: LearnerProfile;
	activeGoal?: LearningGoal;
}

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

// Goal Creation & Diagnostic DTOs
export interface CreateGoalRequest {
	title: string;
	motivation: GoalMotivationType;
	targetOutcome: string;
	deadlineDays: number;
	dailyMinutesBudget: number;
	studyDaysPerWeek: number;
	preferences: ModalityPreference[];
	priorKnowledge: string;
	knownConcepts?: string[];
	weakConcepts?: string[];
	unknownConcepts?: string[];
}

export interface DiagnosticQuestion {
	id: string;
	conceptName: string;
	questionText: string;
	codeSnippet?: string;
	options: string[];
}

export interface DiagnosticEvaluationRequest {
	goalTitle: string;
	answers: { questionId: string; conceptName: string; selectedOptionIndex: number }[];
}

export interface DiagnosticEvaluationResult {
	estimatedLevel: string;
	conceptStates: {
		conceptName: string;
		category: string;
		state: string;
		score: number;
		reason: string;
	}[];
	diagnosticSummary: string;
}

// Teach-Back DTO
export interface TeachBackSubmissionRequest {
	goalId: string;
	conceptName: string;
	promptScenario: string;
	userExplanation: string;
}

// Quiz Attempt DTO
export interface SubmitQuizAttemptRequest {
	quizId: string;
	answers: { questionId: string; selectedOptionIndex: number }[];
}

// Flashcard Review DTO
export interface ReviewFlashcardRequest {
	flashcardId: string;
	rating: 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
}

// Note Save DTO
export interface SaveNoteRequest {
	id?: string;
	goalId: string;
	title: string;
	markdownContent: string;
}

// Quick Inbox Capture DTO
export interface CaptureInboxRequest {
	type: 'URL' | 'YOUTUBE' | 'ARTICLE' | 'SNIPPET' | 'QUESTION' | 'NOTE';
	title: string;
	content: string;
	url?: string;
	goalId?: string;
}

// Dynamic Adaptive Simulation DTO
export interface TriggerAdaptationRequest {
	goalId: string;
	triggerType: 'DFS_RECURSION_GAP' | 'WEAK_AREA_QUIZ_FAIL' | 'DIJKSTRA_STRUGGLE';
	reason?: string;
}
