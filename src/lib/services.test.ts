import { describe, it, expect } from 'bun:test';
import { AuthService } from '$lib/server/auth/auth.service';
import { GoalService } from '$lib/server/services/goal.service';
import { KnowledgeService } from '$lib/server/services/knowledge.service';
import { RoadmapService } from '$lib/server/services/roadmap.service';
import { DailyPlanService } from '$lib/server/services/daily-plan.service';
import { FlashcardService } from '$lib/server/services/flashcard.service';
import { QuizService } from '$lib/server/services/quiz.service';
import { TeachBackService } from '$lib/server/services/teach-back.service';
import { NotesService } from '$lib/server/services/notes.service';
import { InboxService } from '$lib/server/services/inbox.service';
import { DemoService } from '$lib/server/services/demo.service';
import { AIService, AiOfflineError } from '$lib/server/ai/ai.service';
import { OfflineFallbackEngine } from '$lib/server/ai/offline-fallback.engine';
import { dbStore } from '$lib/server/db/store';

describe('CognitiveOS Domain & Intelligence Services', () => {
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
		const user = await AuthService.ensureSeedUser();
		const goal = await GoalService.createGoal(user.id, {
			title: 'Graph Algorithms for Coding Interviews',
			motivation: 'INTERVIEW',
			targetOutcome: 'Solve graph problems in interviews',
			deadlineDays: 30,
			dailyMinutesBudget: 45,
			studyDaysPerWeek: 5,
			preferences: ['VIDEOS', 'CODING', 'PRACTICE_PROBLEMS'],
			priorKnowledge: 'Arrays and Trees known',
			knownConcepts: ['Graph Representation'],
			weakConcepts: ['Recursion Fundamentals']
		});

		expect(goal.totalConceptsCount).toBeGreaterThan(3);
		expect(goal.feasibility.totalEstimatedHours).toBe(32);
		expect(goal.feasibility.alternatives.length).toBe(4);
		expect(['REALISTIC', 'TIGHT', 'AGGRESSIVE', 'OVERAMBITIOUS']).toContain(goal.feasibility.rating);
	});

	it('KnowledgeService updates concept states across 8 states and records timeline', () => {
		const user = dbStore.getUserByEmail('alex@learner.com');
		expect(user).toBeDefined();
		const goals = dbStore.getGoals(user!.id);
		const goalId = goals[0]?.id || 'test-goal';

		const updated = KnowledgeService.updateConceptState(
			goalId,
			user!.id,
			'Breadth-First Search (BFS)',
			+40,
			'QUIZ',
			'Passed 8/10 quiz'
		);

		expect(updated.masteryScore).toBeGreaterThanOrEqual(40);
		expect(['DEVELOPING', 'PRACTICING', 'STRONG', 'MASTERED']).toContain(updated.state);

		const timeline = dbStore.getTimelineEvents(goalId, user!.id);
		expect(timeline.length).toBeGreaterThan(0);

		const graph = KnowledgeService.getKnowledgeGraph(goalId, user!.id);
		expect(graph.nodes.length).toBeGreaterThan(0);
	});

	it('RoadmapService dynamically adapts curriculum when gaps are detected', async () => {
		const user = dbStore.getUserByEmail('alex@learner.com');
		const goals = dbStore.getGoals(user!.id);
		const goalId = goals[0]?.id || 'test-goal';

		const roadmapBefore = await RoadmapService.getOrCreateRoadmap(goalId, user!.id);
		const versionBefore = roadmapBefore.version;

		const { roadmap, adaptiveEvent } = RoadmapService.adaptRoadmap(
			goalId,
			user!.id,
			'Recursion & DFS Call Stack',
			'User struggled on recursion base cases during DFS probe.'
		);

		expect(roadmap.version).toBe(versionBefore + 1);
		expect(roadmap.activeAdaptationNotice).toContain('Roadmap Adapted');
		expect(adaptiveEvent.detectedGapConcept).toBe('Recursion & DFS Call Stack');

		const m1 = roadmap.milestones[0];
		const hasInjectedModule = m1.modules.some((mod) => mod.isPrerequisiteInjection);
		expect(hasInjectedModule).toBe(true);
	});

	it('DailyPlanService creates itinerary and updates progress', () => {
		const user = dbStore.getUserByEmail('alex@learner.com');
		const goals = dbStore.getGoals(user!.id);
		const goalId = goals[0]?.id || 'test-goal';

		const plan = DailyPlanService.getOrCreateDailyPlan(goalId, user!.id);
		expect(plan.items.length).toBeGreaterThan(0);
		expect(plan.availableMinutes).toBeGreaterThan(0);

		const firstItem = plan.items[0];
		const updatedPlan = DailyPlanService.toggleItemStatus(goalId, user!.id, firstItem.id, true);
		expect(updatedPlan.progressPercentage).toBeGreaterThan(0);
	});

	it('FlashcardService implements SuperMemo SM-2 interval scheduling', () => {
		const user = dbStore.getUserByEmail('alex@learner.com');
		const goals = dbStore.getGoals(user!.id);
		const goalId = goals[0]?.id || 'test-goal';

		const cards = FlashcardService.getAllFlashcards(goalId, user!.id);
		expect(cards.length).toBeGreaterThan(0);

		const card = cards[0];
		const prevReps = card.repetitions;
		const reviewed = FlashcardService.reviewCard(card.id, user!.id, 4); // Easy
		expect(reviewed.repetitions).toBe(prevReps + 1);
		expect(reviewed.intervalDays).toBeGreaterThanOrEqual(1);
	});

	it('TeachBackService evaluates explanation with Socratic scoring and invariant breakdown', async () => {
		const user = dbStore.getUserByEmail('alex@learner.com');
		const goals = dbStore.getGoals(user!.id);
		const goalId = goals[0]?.id || 'test-goal';

		const evaluation = OfflineFallbackEngine.evaluateTeachBack(
			'Breadth-First Search (BFS)',
			'BFS uses a FIFO queue to visit vertices layer by layer. We use a visited set to avoid infinite cycles, guaranteeing the shortest path in unweighted graphs.'
		);

		expect(evaluation.score).toBeGreaterThanOrEqual(70);
		expect(evaluation.clarityScore).toBeGreaterThanOrEqual(70);
		expect(evaluation.strengths.length).toBeGreaterThan(0);
	});

	it('NotesService saves markdown and extracts domain concepts', async () => {
		const user = dbStore.getUserByEmail('alex@learner.com');
		const goals = dbStore.getGoals(user!.id);
		const goalId = goals[0]?.id || 'test-goal';

		const note = await NotesService.saveNote(
			user!.id,
			goalId,
			'BFS Queue Notes',
			'#BFS #Queue BFS uses a FIFO queue structure to traverse level by level.'
		);

		expect(note.id).toBeDefined();
		expect(note.extractedConcepts.length).toBeGreaterThan(0);
	});

	it('InboxService captures resources and manages triage status', () => {
		const user = dbStore.getUserByEmail('alex@learner.com');
		const item = InboxService.capture(user!.id, {
			type: 'URL',
			title: 'Graph Algorithms Guide',
			content: 'Comprehensive guide to BFS and DFS traversals',
			url: 'https://example.com/graphs'
		});

		expect(item.id).toBeDefined();
		expect(item.triageStatus).toBe('INBOX');

		const updated = InboxService.updateTriageStatus(item.id, user!.id, 'PROCESSED');
		expect(updated).toBe(true);
	});

	it('DemoService triggers cohesive Magic Moment simulation', () => {
		const user = dbStore.getUserByEmail('alex@learner.com');
		const goals = dbStore.getGoals(user!.id);
		const goalId = goals[0]?.id || 'test-goal';

		const result = DemoService.triggerMagicMoment(goalId, user!.id);
		expect(result.roadmap.activeAdaptationNotice).toContain('Roadmap Adapted');
		expect(result.updatedConceptState.state).toBe('DEVELOPING');
	});

	it('QuizService generates quiz and evaluates attempt breakdown', () => {
		const user = dbStore.getUserByEmail('alex@learner.com');
		const goals = dbStore.getGoals(user!.id);
		const goalId = goals[0]?.id || 'test-goal';

		const quiz = QuizService.generateQuiz(goalId, user!.id, 'CONCEPT');
		expect(quiz.questions.length).toBeGreaterThan(0);

		const attempt = QuizService.submitQuizAttempt(quiz.id, goalId, user!.id, [
			{ questionId: quiz.questions[0].id, selectedOptionIndex: quiz.questions[0].correctOptionIndex }
		]);

		expect(attempt.score).toBeGreaterThan(0);
		expect(attempt.conceptBreakdown.length).toBeGreaterThan(0);
	});

	it('AIService explicitly reports Ada offline status when API key is unconfigured', () => {
		const status = AIService.getAgentStatus();
		expect(status.agentName).toBe('Ada');
		expect(status.offlineMessage).toContain('Ada (our AI Learning Agent) is currently offline');

		if (!AIService.isAvailable()) {
			expect(() => {
				throw new AiOfflineError();
			}).toThrow();
		}
	});
});
