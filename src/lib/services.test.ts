process.env.IS_TEST = 'true';
import { describe, it, expect, beforeAll } from 'bun:test';
import { AuthService } from '$lib/server/auth/auth.service';
import { GoalService } from '$lib/server/services/goal.service';
import { KnowledgeService } from '$lib/server/services/knowledge.service';
import { RoadmapService } from '$lib/server/services/roadmap.service';
import { DailyPlanService } from '$lib/server/services/daily-plan.service';
import { FlashcardService } from '$lib/server/services/flashcard.service';
import { QuizService } from '$lib/server/services/quiz.service';
import { NotesService } from '$lib/server/services/notes.service';
import { InboxService } from '$lib/server/services/inbox.service';
import { DemoService } from '$lib/server/services/demo.service';
import { AIService, AiOfflineError } from '$lib/server/ai/ai.service';
import { OfflineFallbackEngine } from '$lib/server/ai/offline-fallback.engine';
import type { User, LearningGoal } from '$lib/types/domain';

describe('CognitiveOS Domain & Intelligence Services', () => {
	let testUser: User;
	let testGoal: LearningGoal;

	beforeAll(async () => {
		const email = `test-runner-${Date.now()}@example.com`;
		const { user } = await AuthService.register('Test Runner', email, 'runnerPass123');
		testUser = user;

		testGoal = await GoalService.createGoal(testUser.id, {
			title: 'Distributed Systems & Consensus',
			motivation: 'CAREER',
			targetOutcome: 'Design fault-tolerant distributed storage systems',
			deadlineDays: 30,
			dailyMinutesBudget: 45,
			studyDaysPerWeek: 5,
			preferences: ['VIDEOS', 'CODING', 'PRACTICE_PROBLEMS'],
			priorKnowledge: 'Networking basics known'
		});
	});

	it('AuthService registers, hashes passwords, and logs in user correctly', async () => {
		const testEmail = `test-${Date.now()}@example.com`;
		const { user, sessionToken } = await AuthService.register('Test User', testEmail, 'securePass123');

		expect(user.email).toBe(testEmail);
		expect(sessionToken.length).toBe(64);

		const loginResult = await AuthService.login(testEmail, 'securePass123');
		expect(loginResult.user.id).toBe(user.id);
	});

	it('AuthService handles password reset flow with token validation', async () => {
		const testEmail = `reset-${Date.now()}@example.com`;
		const { user } = await AuthService.register('Reset User', testEmail, 'oldPassword123');

		const token = await AuthService.requestPasswordReset(testEmail);
		expect(token).toBeDefined();
		expect(typeof token).toBe('string');

		const resetSuccess = await AuthService.resetPassword(token!, 'newPassword456');
		expect(resetSuccess).toBe(true);

		const newLogin = await AuthService.login(testEmail, 'newPassword456');
		expect(newLogin.user.id).toBe(user.id);
	});

	it('GoalService generates concepts and calculates realistic feasibility', async () => {
		expect(testGoal.totalConceptsCount).toBeGreaterThan(1);
		expect(testGoal.feasibility.totalEstimatedHours).toBeGreaterThan(0);
		expect(['REALISTIC', 'TIGHT', 'AGGRESSIVE', 'OVERAMBITIOUS']).toContain(testGoal.feasibility.rating);
	});

	it('KnowledgeService updates concept states across 8 states and records timeline', () => {
		const states = KnowledgeService.getConceptStates(testGoal.id, testUser.id);
		const conceptName = states[0]?.concept.name || 'Core Foundations';

		const updated = KnowledgeService.updateConceptState(
			testGoal.id,
			testUser.id,
			conceptName,
			+40,
			'QUIZ',
			'Passed assessment quiz'
		);

		expect(updated.masteryScore).toBeGreaterThanOrEqual(40);
		expect(['DEVELOPING', 'PRACTICING', 'STRONG', 'MASTERED']).toContain(updated.state);

		const graph = KnowledgeService.getKnowledgeGraph(testGoal.id, testUser.id);
		expect(graph.nodes.length).toBeGreaterThan(0);
	});

	it('RoadmapService dynamically adapts curriculum when gaps are detected', async () => {
		const roadmapBefore = await RoadmapService.getOrCreateRoadmap(testGoal.id, testUser.id);
		const versionBefore = roadmapBefore.version;

		const { roadmap, adaptiveEvent } = RoadmapService.adaptRoadmap(
			testGoal.id,
			testUser.id,
			'Consensus Invariants',
			'User struggled on raft leader election invariants.'
		);

		expect(roadmap.version).toBe(versionBefore + 1);
		expect(roadmap.activeAdaptationNotice).toContain('Roadmap Adapted');
		expect(adaptiveEvent.detectedGapConcept).toBe('Consensus Invariants');
	});

	it('DailyPlanService creates itinerary and updates progress', () => {
		const plan = DailyPlanService.getOrCreateDailyPlan(testGoal.id, testUser.id);
		expect(plan.items.length).toBeGreaterThan(0);
		expect(plan.availableMinutes).toBeGreaterThan(0);

		const firstItem = plan.items[0];
		const updatedPlan = DailyPlanService.toggleItemStatus(testGoal.id, testUser.id, firstItem.id, true);
		expect(updatedPlan.progressPercentage).toBeGreaterThan(0);
	});

	it('FlashcardService implements SuperMemo SM-2 interval scheduling', () => {
		const cards = FlashcardService.getAllFlashcards(testGoal.id, testUser.id);
		expect(cards.length).toBeGreaterThan(0);

		const card = cards[0];
		const prevReps = card.repetitions;
		const reviewed = FlashcardService.reviewCard(card.id, testUser.id, 4); // Easy
		expect(reviewed.repetitions).toBe(prevReps + 1);
		expect(reviewed.intervalDays).toBeGreaterThanOrEqual(1);
	});

	it('TeachBackService evaluates explanation with Socratic scoring and invariant breakdown', async () => {
		const evaluation = OfflineFallbackEngine.evaluateTeachBack(
			'Distributed Consensus',
			'Raft decomposes consensus into leader election, log replication, and safety. Only a candidate with an up-to-date log can become leader.'
		);

		expect(evaluation.score).toBeGreaterThanOrEqual(70);
		expect(evaluation.clarityScore).toBeGreaterThanOrEqual(70);
		expect(evaluation.strengths.length).toBeGreaterThan(0);
	});

	it('NotesService saves markdown and extracts domain concepts', async () => {
		const note = await NotesService.saveNote(
			testUser.id,
			testGoal.id,
			'Consensus Protocol Notes',
			'#DistributedSystems #Raft Raft maintains a replicated state machine across nodes with quorum voting.'
		);

		expect(note.id).toBeDefined();
		expect(note.extractedConcepts.length).toBeGreaterThan(0);
	});

	it('InboxService captures resources and manages triage status', () => {
		const item = InboxService.capture(testUser.id, {
			type: 'URL',
			title: 'Raft Consensus Paper',
			content: 'In Search of an Understandable Consensus Algorithm',
			url: 'https://raft.github.io/raft.pdf'
		});

		expect(item.id).toBeDefined();
		expect(item.triageStatus).toBe('INBOX');

		const updated = InboxService.updateTriageStatus(item.id, testUser.id, 'PROCESSED');
		expect(updated).toBe(true);
	});

	it('DemoService triggers cohesive Magic Moment simulation', () => {
		const result = DemoService.triggerMagicMoment(testGoal.id, testUser.id);
		expect(result.roadmap.activeAdaptationNotice).toContain('Roadmap Adapted');
		expect(result.updatedConceptState.state).toBe('DEVELOPING');
	});

	it('QuizService generates quiz and evaluates attempt breakdown', () => {
		const quiz = QuizService.generateQuiz(testGoal.id, testUser.id, 'CONCEPT');
		expect(quiz.questions.length).toBeGreaterThan(0);

		const attempt = QuizService.submitQuizAttempt(quiz.id, testGoal.id, testUser.id, [
			{ questionId: quiz.questions[0].id, selectedOptionIndex: quiz.questions[0].correctOptionIndex }
		]);

		expect(attempt.score).toBeGreaterThan(0);
		expect(attempt.conceptBreakdown.length).toBeGreaterThan(0);
	});

	it('AIService explicitly reports Ada status correctly', () => {
		const status = AIService.getAgentStatus();
		expect(status.agentName).toBe('Ada');
	});
});
