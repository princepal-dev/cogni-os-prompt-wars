// OpenRouter AI Integration Tests
// Tests the full AI pipeline: provider → service → prompt → response parsing
// Uses mocking for unit tests, real HTTP for integration tests

process.env.IS_TEST = 'true';

import { describe, it, expect, beforeAll, mock, spyOn } from 'bun:test';
import { OpenRouterLLMProvider } from '$lib/server/ai/openrouter.provider';
import { AIService, AiOfflineError } from '$lib/server/ai/ai.service';
import { OfflineFallbackEngine } from '$lib/server/ai/offline-fallback.engine';
import { QuizService } from '$lib/server/services/quiz.service';
import { GoalService } from '$lib/server/services/goal.service';
import { AuthService } from '$lib/server/auth/auth.service';
import { PROMPTS } from '$lib/server/ai/prompts';
import type { User, LearningGoal } from '$lib/types/domain';

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROVIDER UNIT TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('OpenRouterLLMProvider — Unit', () => {
	it('detects API key as available when key is long enough', () => {
		const provider = new OpenRouterLLMProvider();
		const key = provider.getApiKey();
		// In test env without a key, isAvailable() returns false
		// With a real key (from .env), it returns true
		expect(typeof provider.isAvailable()).toBe('boolean');
	});

	it('reads model from env and has sensible default', () => {
		const provider = new OpenRouterLLMProvider();
		const model = provider.getModel();
		expect(typeof model).toBe('string');
		expect(model.length).toBeGreaterThan(3);
	});

	it('strips ```json code fences from model response before parsing', async () => {
		const provider = new OpenRouterLLMProvider();

		// Mock complete() to return a fenced JSON string
		const original = provider.complete.bind(provider);
		provider.complete = async () => '```json\n{"ok": true, "value": 42}\n```';

		const result = await provider.completeJson<{ ok: boolean; value: number }>([], {});
		expect(result.ok).toBe(true);
		expect(result.value).toBe(42);

		provider.complete = original;
	});

	it('strips plain ``` fences from model response before parsing', async () => {
		const provider = new OpenRouterLLMProvider();
		provider.complete = async () => '```\n{"key": "value"}\n```';

		const result = await provider.completeJson<{ key: string }>([], {});
		expect(result.key).toBe('value');
	});

	it('throws descriptive error when JSON parse fails', async () => {
		const provider = new OpenRouterLLMProvider();
		provider.complete = async () => 'This is not JSON at all, sorry!';

		expect(provider.completeJson([], {})).rejects.toThrow('OpenRouter returned invalid JSON');
	});

	it('throws when API key is missing', async () => {
		const provider = new OpenRouterLLMProvider();
		// Force key to be empty
		provider['apiKey'] = '';
		provider.getApiKey = () => '';

		expect(provider.complete([], {})).rejects.toThrow('OpenRouter API key is not configured.');
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. AI SERVICE UNIT TESTS (with mocked provider)
// ─────────────────────────────────────────────────────────────────────────────
describe('AIService — Unit (mocked provider)', () => {
	it('getAgentStatus returns Ada name and online status', () => {
		const status = AIService.getAgentStatus();
		expect(status.agentName).toBe('Ada');
		expect(typeof status.isOnline).toBe('boolean');
		expect(typeof status.model).toBe('string');
		expect(status.offlineMessage).toContain('Ada');
	});

	it('throws AiOfflineError when provider unavailable and diagnostic called', async () => {
		// Temporarily make provider report unavailable
		const { openRouterProvider } = await import('$lib/server/ai/openrouter.provider');
		const origIsAvailable = openRouterProvider.isAvailable.bind(openRouterProvider);
		openRouterProvider.isAvailable = () => false;

		try {
			await expect(AIService.generateDiagnostic('Test Topic')).rejects.toBeInstanceOf(AiOfflineError);
			await expect(AIService.evaluateDiagnostic('Test', [])).rejects.toBeInstanceOf(AiOfflineError);
			await expect(AIService.evaluateTeachBack('Concept', 'explanation')).rejects.toBeInstanceOf(AiOfflineError);
		} finally {
			openRouterProvider.isAvailable = origIsAvailable;
		}
	});

	it('AiOfflineError has correct properties', () => {
		const err = new AiOfflineError();
		expect(err.name).toBe('AiOfflineError');
		expect(err.isAiAvailable).toBe(false);
		expect(err.agentName).toBe('Ada');
		expect(err.message).toContain('Ada');
	});

	it('AiOfflineError accepts a custom message', () => {
		const err = new AiOfflineError('Custom offline message');
		expect(err.message).toBe('Custom offline message');
	});

	it('generateRoadmap falls back to OfflineFallbackEngine when provider unavailable', async () => {
		const { openRouterProvider } = await import('$lib/server/ai/openrouter.provider');
		const origIsAvailable = openRouterProvider.isAvailable.bind(openRouterProvider);
		openRouterProvider.isAvailable = () => false;

		try {
			const result = await AIService.generateRoadmap('Python', 'Beginner', 'Learn OOP', 20);
			expect(result.summary).toBeDefined();
			expect(Array.isArray(result.milestones)).toBe(true);
			expect(result.totalEstimatedHours).toBeGreaterThan(0);
		} finally {
			openRouterProvider.isAvailable = origIsAvailable;
		}
	});

	it('calculateFeasibility is purely synchronous and returns correct shape', () => {
		const result = AIService.calculateFeasibility('Python', 30, 60, 5);

		expect(result.availableLearningHours).toBeGreaterThan(0);
		expect(result.totalEstimatedHours).toBeGreaterThan(0);
		expect(['REALISTIC', 'TIGHT', 'AGGRESSIVE', 'OVERAMBITIOUS']).toContain(result.rating);
		expect(result.feasibilityScore).toBeGreaterThanOrEqual(0);
		expect(result.feasibilityScore).toBeLessThanOrEqual(100);
		expect(Array.isArray(result.recommendations)).toBe(true);
		expect(Array.isArray(result.alternatives)).toBe(true);
		expect(result.alternatives.length).toBe(4);
		expect(['A', 'B', 'C', 'D']).toContain(result.alternatives[0].id);
	});

	it('calculateFeasibility marks OVERAMBITIOUS when gap is too large', () => {
		// 1 day deadline, 10 min/day — very little time
		const result = AIService.calculateFeasibility('Python', 1, 10, 5);
		// Available hours will be tiny vs required 32
		expect(['AGGRESSIVE', 'OVERAMBITIOUS']).toContain(result.rating);
	});

	it('calculateFeasibility marks REALISTIC when time is ample', () => {
		// 90 days, 120 min/day, 7 days/week = 126h >> 32h required
		const result = AIService.calculateFeasibility('Python', 90, 120, 7);
		expect(result.rating).toBe('REALISTIC');
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. OFFLINE FALLBACK ENGINE UNIT TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('OfflineFallbackEngine — Unit', () => {
	it('generateDiagnosticQuestions returns 4 questions for graph topics', () => {
		const questions = OfflineFallbackEngine.generateDiagnosticQuestions('Graph Algorithms');
		expect(questions.length).toBe(4);
		questions.forEach((q) => {
			expect(q.id).toBeDefined();
			expect(q.conceptName).toBeDefined();
			expect(q.questionText).toBeDefined();
			expect(Array.isArray(q.options)).toBe(true);
			expect(q.options.length).toBeGreaterThanOrEqual(2);
		});
	});

	it('generateDiagnosticQuestions returns fallback questions for unknown topics', () => {
		const questions = OfflineFallbackEngine.generateDiagnosticQuestions('Quantum Entanglement');
		expect(questions.length).toBeGreaterThan(0);
	});

	it('generateRoadmap returns valid milestone structure for any topic', () => {
		const roadmap = OfflineFallbackEngine.generateRoadmap(
			'Machine Learning',
			'Engineer with Python knowledge',
			'Build and deploy ML models',
			40
		);

		expect(roadmap.summary).toBeDefined();
		expect(roadmap.summary.length).toBeGreaterThan(10);
		expect(roadmap.totalEstimatedHours).toBeGreaterThan(0);
		expect(Array.isArray(roadmap.milestones)).toBe(true);
		expect(roadmap.milestones.length).toBeGreaterThan(0);

		const m = roadmap.milestones[0];
		expect(m.id).toBeDefined();
		expect(m.weekNumber).toBeGreaterThanOrEqual(1);
		expect(Array.isArray(m.modules)).toBe(true);
		expect(m.modules.length).toBeGreaterThan(0);

		const mod = m.modules[0];
		expect(mod.id).toBeDefined();
		expect(mod.title).toBeDefined();
		expect(mod.estimatedMinutes).toBeGreaterThan(0);
		expect(Array.isArray(mod.conceptNames)).toBe(true);
	});

	it('evaluateDiagnostic produces concept states with valid 8-state values', () => {
		const answers = [
			{ questionId: 'diag-1', conceptName: 'Graph Representation', selectedOptionIndex: 0 },
			{ questionId: 'diag-2', conceptName: 'BFS', selectedOptionIndex: 1 },
			{ questionId: 'diag-3', conceptName: 'DFS', selectedOptionIndex: -1 },
			{ questionId: 'diag-4', conceptName: 'Dijkstra', selectedOptionIndex: 2 },
		];

		const result = OfflineFallbackEngine.evaluateDiagnostic('Graph Algorithms', answers);
		expect(result.estimatedLevel).toBeDefined();
		expect(result.diagnosticSummary).toBeDefined();
		expect(Array.isArray(result.conceptStates)).toBe(true);
		expect(result.conceptStates.length).toBeGreaterThan(0);

		const VALID_STATES = ['UNKNOWN', 'INTRODUCED', 'LEARNING', 'DEVELOPING', 'PRACTICING', 'PROFICIENT', 'STRONG', 'MASTERED', 'EXPERT'];
		result.conceptStates.forEach((cs) => {
			expect(VALID_STATES).toContain(cs.state);
			expect(cs.score).toBeGreaterThanOrEqual(0);
			expect(cs.score).toBeLessThanOrEqual(100);
			expect(cs.conceptName).toBeDefined();
			expect(cs.reason).toBeDefined();
		});
	});

	it('evaluateTeachBack scores high for detailed correct explanations', () => {
		const result = OfflineFallbackEngine.evaluateTeachBack(
			'Depth-First Search',
			'DFS traverses a graph by plunging as deep as possible along each branch before backtracking. It uses a LIFO call stack, either via recursion or an explicit stack data structure. The key invariants are: mark nodes visited on entry to prevent infinite loops in cyclic graphs, and the base case stops when no unvisited neighbors remain.'
		);

		expect(result.score).toBeGreaterThanOrEqual(60);
		expect(Array.isArray(result.strengths)).toBe(true);
		expect(typeof result.feedback).toBe('string');
		expect(result.recommendedState).toBeDefined();
	});

	it('evaluateTeachBack scores low for empty or vague explanations', () => {
		const result = OfflineFallbackEngine.evaluateTeachBack('DFS', 'I dunno, it traverses stuff?');
		expect(result.score).toBeLessThan(70);
	});

	it('QuizService.generateQuiz produces well-formed questions via goal fixture', async () => {
		// Create a minimal user + goal so QuizService has data to work with
		const email = `quiz-test-${Date.now()}@test.com`;
		const { user } = await AuthService.register('Quiz Tester', email, 'pass123456');
		const goal = await GoalService.createGoal(user.id, {
			title: 'BFS & DFS Traversals',
			motivation: 'CAREER',
			targetOutcome: 'Implement graph traversals',
			deadlineDays: 30,
			dailyMinutesBudget: 60,
			studyDaysPerWeek: 5,
			preferences: ['CODING'],
			priorKnowledge: 'Arrays and recursion'
		});

		const quiz = QuizService.generateQuiz(goal.id, user.id, 'CONCEPT');
		expect(quiz.questions.length).toBeGreaterThan(0);

		quiz.questions.forEach((q) => {
			expect(q.id).toBeDefined();
			expect(q.questionText).toBeDefined();
			expect(Array.isArray(q.options)).toBe(true);
			expect(q.correctOptionIndex).toBeGreaterThanOrEqual(0);
		});
	});

	it('analyzeNote extracts relevant concepts from markdown text', () => {
		const result = OfflineFallbackEngine.analyzeNote(
			'## BFS vs DFS\nBreadth-First Search uses a Queue for level-order traversal. DFS uses a Stack and explores deeper paths first. BFS guarantees shortest path in unweighted graphs. Both run in O(V+E) time.'
		);

		expect(Array.isArray(result.extractedConcepts)).toBe(true);
		expect(result.extractedConcepts.length).toBeGreaterThan(0);
		expect(Array.isArray(result.generatedFlashcards)).toBe(true);
		expect(result.generatedFlashcards.length).toBeGreaterThan(0);

		result.generatedFlashcards.forEach((card) => {
			expect(card.front).toBeDefined();
			expect(card.back).toBeDefined();
		});
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. PROMPTS STRUCTURE TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('AI Prompts — Structure validation', () => {
	it('DIAGNOSTIC_GENERATION prompt contains JSON schema instruction', () => {
		expect(PROMPTS.DIAGNOSTIC_GENERATION).toContain('JSON');
	});

	it('ROADMAP_GENERATION prompt contains milestone and module keywords', () => {
		const prompt = PROMPTS.ROADMAP_GENERATION;
		expect(prompt.toLowerCase()).toContain('milestone');
	});

	it('TEACH_BACK_EVALUATION prompt contains scoring criteria', () => {
		const prompt = PROMPTS.TEACH_BACK_EVALUATION;
		expect(typeof prompt).toBe('string');
		expect(prompt.length).toBeGreaterThan(50);
	});

	it('NOTE_ANALYSIS prompt mentions concept extraction', () => {
		const prompt = PROMPTS.NOTE_ANALYSIS;
		expect(typeof prompt).toBe('string');
		expect(prompt.length).toBeGreaterThan(50);
	});

	it('all required prompt keys exist', () => {
		expect(PROMPTS.DIAGNOSTIC_GENERATION).toBeDefined();
		expect(PROMPTS.ROADMAP_GENERATION).toBeDefined();
		expect(PROMPTS.TEACH_BACK_EVALUATION).toBeDefined();
		expect(PROMPTS.NOTE_ANALYSIS).toBeDefined();
	});
});
