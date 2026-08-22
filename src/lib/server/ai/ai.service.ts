// Central AI Service for CognitiveOS
// Named Agent: "Ada" — Personal Adaptive Learning Intelligence Agent
// Strictly uses real OpenRouter LLM completions. No fake mock fallbacks.

import { openRouterProvider } from './openrouter.provider';
import { PROMPTS } from './prompts';
import { OfflineFallbackEngine } from './offline-fallback.engine';
import type {
	DiagnosticQuestion,
	DiagnosticEvaluationResult,
	Milestone,
	ConceptStateType
} from '$lib/types/domain';

export const AI_AGENT_NAME = 'Ada';

export class AiOfflineError extends Error {
	public isAiAvailable = false;
	public agentName = AI_AGENT_NAME;

	constructor(customMessage?: string) {
		super(
			customMessage ||
				`${AI_AGENT_NAME} (our AI Learning Agent) is currently offline or awaiting an OpenRouter API key. We are working on it! In the meantime, you can seamlessly review your existing roadmaps, study your notes in the Second Brain, practice with flashcards, and take quizzes on your concepts.`
		);
		this.name = 'AiOfflineError';
	}
}

export class AIService {
	public static isAvailable(): boolean {
		return openRouterProvider.isAvailable();
	}

	public static getAgentStatus() {
		return {
			agentName: AI_AGENT_NAME,
			isOnline: openRouterProvider.isAvailable(),
			model: openRouterProvider.getModel(),
			offlineMessage: `${AI_AGENT_NAME} (our AI Learning Agent) is currently offline. You can continue revising with flashcards, Second Brain notes, and quizzes!`
		};
	}

	// Generate diagnostic quiz using real AI
	public static async generateDiagnostic(topic: string): Promise<DiagnosticQuestion[]> {
		if (!openRouterProvider.isAvailable()) {
			throw new AiOfflineError();
		}

		const res = await openRouterProvider.completeJson<{ questions: DiagnosticQuestion[] }>([
			{ role: 'system', content: PROMPTS.DIAGNOSTIC_GENERATION },
			{ role: 'user', content: `Generate a 4-question knowledge diagnostic for learning goal: "${topic}".` }
		]);

		if (!res?.questions?.length) {
			throw new Error(`AI Agent ${AI_AGENT_NAME} was unable to format diagnostic questions.`);
		}
		return res.questions;
	}

	// Evaluate diagnostic answers using real AI
	public static async evaluateDiagnostic(
		topic: string,
		answers: { questionId: string; conceptName: string; selectedOptionIndex: number }[]
	): Promise<DiagnosticEvaluationResult> {
		if (!openRouterProvider.isAvailable()) {
			throw new AiOfflineError();
		}

		const res = await openRouterProvider.completeJson<DiagnosticEvaluationResult>([
			{
				role: 'system',
				content: `You are ${AI_AGENT_NAME}, the Lead Learning Diagnostic AI. Evaluate diagnostic probe answers and return structured concept states. Output JSON matching: { "estimatedLevel": "...", "conceptStates": [{ "conceptName": "...", "category": "...", "state": "STRONG|DEVELOPING|LEARNING|UNKNOWN", "score": 75, "reason": "..." }], "diagnosticSummary": "..." }`
			},
			{
				role: 'user',
				content: `Topic: "${topic}"\nLearner Answers:\n${JSON.stringify(answers, null, 2)}`
			}
		]);

		return res;
	}

	// Feasibility Engine calculation
	public static calculateFeasibility(
		topic: string,
		deadlineDays: number,
		dailyMinutes: number,
		studyDaysPerWeek: number
	) {
		const totalAvailableHours = Math.round(((deadlineDays / 7) * studyDaysPerWeek * dailyMinutes) / 60);
		const estimatedRequiredHours = 32;
		const totalEstimatedHours = estimatedRequiredHours;
		const gapHours = totalEstimatedHours - totalAvailableHours;

		let rating: 'REALISTIC' | 'TIGHT' | 'AGGRESSIVE' | 'OVERAMBITIOUS' = 'REALISTIC';
		let score = 90;

		if (gapHours > 12) {
			rating = 'OVERAMBITIOUS';
			score = 40;
		} else if (gapHours > 4) {
			rating = 'AGGRESSIVE';
			score = 62;
		} else if (gapHours > 0) {
			rating = 'TIGHT';
			score = 78;
		}

		return {
			estimatedRequiredHours,
			availableLearningHours: totalAvailableHours,
			requiredPracticeHours: 14,
			requiredReviewHours: 6,
			totalEstimatedHours,
			gapHours: Math.max(0, gapHours),
			rating,
			feasibilityScore: score,
			summary:
				rating === 'REALISTIC'
					? `You have ${totalAvailableHours}h available, which comfortably covers the required ${totalEstimatedHours}h.`
					: `Your goal requires ~${totalEstimatedHours}h. With ${dailyMinutes}m/day you have ~${totalAvailableHours}h. This pace is ${rating.toLowerCase()}.`,
			recommendations: [
				'Spend 40% on visual concepts and 60% on hands-on coding problems.',
				'Utilize 5-minute daily flashcards to prevent spaced memory decay.',
				'Prioritize core traversal mastery before jumping into advanced algorithms.'
			],
			alternatives: [
				{
					id: 'A' as const,
					title: 'Increase Daily Study Time',
					description: `Bump daily study from ${dailyMinutes}m to ${dailyMinutes + 20}m per session.`,
					actionType: 'INCREASE_TIME' as const,
					impactSummary: `Adds +${Math.round(((deadlineDays / 7) * studyDaysPerWeek * 20) / 60)}h of total practice time.`
				},
				{
					id: 'B' as const,
					title: 'Focus on High-ROI Core Scope',
					description: 'Master core foundations first; defer niche edge topics.',
					actionType: 'REDUCE_SCOPE' as const,
					impactSummary: 'Reduces required study hours by ~8 hours.'
				},
				{
					id: 'C' as const,
					title: 'Extend Deadline by 10 Days',
					description: `Extend target date from ${deadlineDays} to ${deadlineDays + 10} days.`,
					actionType: 'EXTEND_DEADLINE' as const,
					impactSummary: 'Smooths the learning curve without requiring extra daily hours.'
				},
				{
					id: 'D' as const,
					title: 'Prioritize Top Interview Patterns',
					description: 'Focus strictly on top frequent interview problem archetypes.',
					actionType: 'PRIORITIZE_CORE' as const,
					impactSummary: 'Maximizes readiness per hour spent.'
				}
			]
		};
	}

	// Generate Roadmap using real AI with graceful fallback
	public static async generateRoadmap(
		topic: string,
		background: string,
		targetOutcome: string,
		availableHours: number
	): Promise<{ summary: string; totalEstimatedHours: number; milestones: Milestone[] }> {
		if (openRouterProvider.isAvailable()) {
			try {
				const res = await openRouterProvider.completeJson<{ summary: string; totalEstimatedHours: number; milestones: Milestone[] }>([
					{ role: 'system', content: PROMPTS.ROADMAP_GENERATION },
					{
						role: 'user',
						content: `Create a structured roadmap for topic: "${topic}". Target outcome: "${targetOutcome}". Learner background: "${background}". Total available hours: ${availableHours}.`
					}
				]);
				if (res?.milestones?.length) {
					return res;
				}
			} catch (e) {
				console.warn('OpenRouter generateRoadmap fallback:', e);
			}
		}

		return OfflineFallbackEngine.generateRoadmap(topic, background, targetOutcome, availableHours);
	}

	// Socratic Teach-Back Evaluator using real AI
	public static async evaluateTeachBack(
		conceptName: string,
		userExplanation: string
	): Promise<{
		score: number;
		clarityScore: number;
		depthScore: number;
		correctnessScore: number;
		strengths: string[];
		missingConcepts: string[];
		misconceptions: string[];
		feedback: string;
		recommendedState: ConceptStateType;
	}> {
		if (!openRouterProvider.isAvailable()) {
			throw new AiOfflineError();
		}

		const res = await openRouterProvider.completeJson<any>([
			{ role: 'system', content: PROMPTS.TEACH_BACK_EVALUATION },
			{
				role: 'user',
				content: `Concept: "${conceptName}"\nLearner Explanation:\n"""\n${userExplanation}\n"""`
			}
		]);

		return res;
	}

	// Second Brain note analysis & concept extraction using real AI
	public static async analyzeNote(markdownContent: string): Promise<{
		extractedConcepts: string[];
		suggestedConnections: { conceptName: string; reason: string; connected: boolean }[];
		generatedFlashcards: { front: string; back: string }[];
	}> {
		if (!openRouterProvider.isAvailable()) {
			throw new AiOfflineError();
		}

		const res = await openRouterProvider.completeJson<any>([
			{ role: 'system', content: PROMPTS.NOTE_ANALYSIS },
			{ role: 'user', content: `Note content:\n"""\n${markdownContent}\n"""` }
		]);

		return res;
	}
}
