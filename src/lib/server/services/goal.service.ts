// Goal Service: Onboarding, Feasibility, and Goal Management

import crypto from 'node:crypto';
import { dbStore } from '../db/store';
import { AIService } from '../ai/ai.service';
import { NeonPostgresService } from '../db/neon-postgres';
import type {
	LearningGoal,
	KnowledgeConcept,
	KnowledgeState,
	CreateGoalRequest,
	User
} from '$lib/types/domain';

export class GoalService {
	// Create a new learning goal with feasibility analysis and concept seeding
	public static async createGoal(userId: string, req: CreateGoalRequest): Promise<LearningGoal> {
		const goalId = crypto.randomUUID();
		const deadlineDate = new Date(Date.now() + req.deadlineDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

		// Calculate Feasibility
		const feasibility = AIService.calculateFeasibility(
			req.title,
			req.deadlineDays,
			req.dailyMinutesBudget,
			req.studyDaysPerWeek
		);

		const goal: LearningGoal = {
			id: goalId,
			userId,
			title: req.title.trim(),
			motivation: req.motivation,
			targetOutcome: req.targetOutcome.trim(),
			deadline: deadlineDate,
			dailyMinutesBudget: req.dailyMinutesBudget,
			studyDaysPerWeek: req.studyDaysPerWeek,
			preferences: req.preferences,
			initialKnowledgeLevel: 'BASIC',
			status: 'ACTIVE',
			feasibility,
			totalConceptsCount: 0,
			masteredConceptsCount: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		dbStore.saveGoal(goal);

		// Seed domain concepts based on goal title
		const concepts = GoalService.generateInitialConcepts(goalId, req.title);
		dbStore.saveConcepts(concepts);

		// Initialize concept knowledge states
		const states: KnowledgeState[] = concepts.map((c) => {
			let initialScore = 0;
			let state: any = 'UNKNOWN';

			if (req.knownConcepts?.some((k) => k.toLowerCase() === c.name.toLowerCase())) {
				initialScore = 75;
				state = 'STRONG';
			} else if (req.weakConcepts?.some((w) => w.toLowerCase() === c.name.toLowerCase())) {
				initialScore = 30;
				state = 'DEVELOPING';
			}

			return {
				id: crypto.randomUUID(),
				conceptId: c.id,
				conceptName: c.name,
				goalId,
				userId,
				state,
				masteryScore: initialScore,
				recallStrength: 100,
				lastAssessedAt: new Date().toISOString(),
				reviewDueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
				timesReviewed: 0,
				timesPracticed: 0,
				errorFrequency: 0,
				recentMisconceptions: [],
				notesCount: 0
			};
		});
		dbStore.saveKnowledgeStates(states);

		// Update concept counts
		goal.totalConceptsCount = concepts.length;
		goal.masteredConceptsCount = states.filter((s) => s.state === 'MASTERED' || s.state === 'STRONG').length;
		dbStore.saveGoal(goal);
		NeonPostgresService.saveGoal(goal);

		return goal;
	}

	// Helper to generate domain concepts
	public static generateInitialConcepts(goalId: string, title: string): KnowledgeConcept[] {
		const isGraphs = title.toLowerCase().includes('graph');
		if (isGraphs) {
			return [
				{
					id: `c-rep-${goalId.slice(0, 4)}`,
					goalId,
					name: 'Graph Representation',
					slug: 'graph-representation',
					category: 'Fundamentals',
					description: 'Adjacency lists, matrices, and edge lists for modeling graphs.',
					importance: 'CRITICAL',
					estimatedHoursToLearn: 2,
					prerequisites: [],
					subconcepts: ['Adjacency List', 'Adjacency Matrix', 'Space Complexity']
				},
				{
					id: `c-bfs-${goalId.slice(0, 4)}`,
					goalId,
					name: 'Breadth-First Search (BFS)',
					slug: 'breadth-first-search',
					category: 'Traversals',
					description: 'Queue-based level-order traversal for unweighted shortest paths.',
					importance: 'CRITICAL',
					estimatedHoursToLearn: 3,
					prerequisites: ['Graph Representation'],
					subconcepts: ['FIFO Queue', 'Level-order', 'Visited Tracking']
				},
				{
					id: `c-rec-${goalId.slice(0, 4)}`,
					goalId,
					name: 'Recursion Fundamentals',
					slug: 'recursion-fundamentals',
					category: 'Prerequisites',
					description: 'Call stack dynamics, base cases, and recursive state management.',
					importance: 'CORE',
					estimatedHoursToLearn: 2,
					prerequisites: [],
					subconcepts: ['Call Stack', 'Base Case', 'Backtracking']
				},
				{
					id: `c-dfs-${goalId.slice(0, 4)}`,
					goalId,
					name: 'Depth-First Search (DFS)',
					slug: 'depth-first-search',
					category: 'Traversals',
					description: 'Recursive path exploration and cycle detection.',
					importance: 'CRITICAL',
					estimatedHoursToLearn: 3,
					prerequisites: ['Graph Representation', 'Recursion Fundamentals'],
					subconcepts: ['Stack / Recursion', 'Cycle Detection', 'Connected Components']
				},
				{
					id: `c-dijkstra-${goalId.slice(0, 4)}`,
					goalId,
					name: 'Dijkstra & Shortest Paths',
					slug: 'dijkstra-shortest-paths',
					category: 'Algorithms',
					description: 'Greedy shortest path algorithm with Min-Heaps on non-negative weighted graphs.',
					importance: 'CRITICAL',
					estimatedHoursToLearn: 4,
					prerequisites: ['Breadth-First Search (BFS)'],
					subconcepts: ['Min-Heap', 'Edge Relaxation', 'Non-negative Invariant']
				},
				{
					id: `c-mst-${goalId.slice(0, 4)}`,
					goalId,
					name: 'Minimum Spanning Tree (MST)',
					slug: 'minimum-spanning-tree',
					category: 'Algorithms',
					description: 'Kruskal and Prim algorithms with Disjoint Set Union (DSU).',
					importance: 'CORE',
					estimatedHoursToLearn: 4,
					prerequisites: ['Graph Representation'],
					subconcepts: ['Union-Find', 'Cut Property', 'Greedy Selection']
				},
				{
					id: `c-topo-${goalId.slice(0, 4)}`,
					goalId,
					name: 'Topological Sort',
					slug: 'topological-sort',
					category: 'Directed Graphs',
					description: 'Kahn’s algorithm and DFS post-order for dependency scheduling in DAGs.',
					importance: 'CORE',
					estimatedHoursToLearn: 3,
					prerequisites: ['Depth-First Search (DFS)'],
					subconcepts: ['In-degree Array', 'DAG Invariant', 'Cycle Identification']
				}
			];
		}

		// Generic concepts
		return [
			{
				id: `c-fund-${goalId.slice(0, 4)}`,
				goalId,
				name: 'Core Foundations',
				slug: 'core-foundations',
				category: 'Fundamentals',
				description: `Fundamental principles and prerequisites for ${title}.`,
				importance: 'CRITICAL',
				estimatedHoursToLearn: 3,
				prerequisites: [],
				subconcepts: ['Terminology', 'Architecture']
			},
			{
				id: `c-core-${goalId.slice(0, 4)}`,
				goalId,
				name: 'Key Implementation Patterns',
				slug: 'implementation-patterns',
				category: 'Practice',
				description: 'Hands-on techniques and problem solving.',
				importance: 'CORE',
				estimatedHoursToLearn: 5,
				prerequisites: ['Core Foundations'],
				subconcepts: ['Best Practices', 'Debugging']
			}
		];
	}

	// Get all goals for a user with live progress percentages
	public static getUserGoals(userId: string): LearningGoal[] {
		const goals = dbStore.getGoals(userId);
		for (const g of goals) {
			const states = dbStore.getKnowledgeStates(g.id, userId);
			g.totalConceptsCount = states.length;
			g.masteredConceptsCount = states.filter((s) => s.state === 'MASTERED' || s.state === 'STRONG').length;
		}
		return goals;
	}

	// Ensure seed demo goal for evaluation
	public static async ensureSeedGoal(user: User): Promise<LearningGoal> {
		const existingGoals = dbStore.getGoals(user.id);
		if (existingGoals.length > 0) {
			return existingGoals[0];
		}

		const goal = await GoalService.createGoal(user.id, {
			title: 'Graph Algorithms for Coding Interviews',
			motivation: 'INTERVIEW',
			targetOutcome: 'Confidently solve Medium/Hard graph questions in technical interviews',
			deadlineDays: 30,
			dailyMinutesBudget: 45,
			studyDaysPerWeek: 5,
			preferences: ['VIDEOS', 'CODING', 'PRACTICE_PROBLEMS'],
			priorKnowledge: 'Arrays, Linked Lists, Binary Trees known; Recursion developing; Graph Algorithms unknown',
			knownConcepts: ['Graph Representation'],
			weakConcepts: ['Recursion Fundamentals', 'Breadth-First Search (BFS)'],
			unknownConcepts: ['Depth-First Search (DFS)', 'Dijkstra & Shortest Paths', 'Minimum Spanning Tree (MST)', 'Topological Sort']
		});

		return goal;
	}
}
