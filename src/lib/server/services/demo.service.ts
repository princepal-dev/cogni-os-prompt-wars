// Demo Service & Magic Moment Simulation
// Powering the cohesive hackathon evaluation scenario (Section 44 & 45)

import { GoalService } from './goal.service';
import { KnowledgeService } from './knowledge.service';
import { RoadmapService } from './roadmap.service';
import { DailyPlanService } from './daily-plan.service';
import { dbStore } from '../db/store';
import type { User, LearningGoal, Roadmap, AdaptiveEvent } from '$lib/types/domain';

export class DemoService {
	// Setup full demo scenario for a user
	public static async setupDemoEnvironment(user: User): Promise<{
		goal: LearningGoal;
		roadmap: Roadmap;
	}> {
		const goal = await GoalService.ensureSeedGoal(user);
		const roadmap = await RoadmapService.getOrCreateRoadmap(goal.id, user.id);
		DailyPlanService.getOrCreateDailyPlan(goal.id, user.id);
		return { goal, roadmap };
	}

	// Trigger the "Magic Moment" dynamic adaptation
	public static triggerMagicMoment(
		goalId: string,
		userId: string
	): {
		roadmap: Roadmap;
		adaptiveEvent: AdaptiveEvent;
		updatedConceptState: any;
	} {
		// 1. Update DFS and Recursion concept states to reflect detected gap
		const updatedConceptState = KnowledgeService.updateConceptState(
			goalId,
			userId,
			'Depth-First Search (DFS)',
			-20,
			'QUIZ',
			'Struggled with recursion call stack and cycle backtracking in quiz attempt.',
			'DEVELOPING'
		);

		KnowledgeService.updateConceptState(
			goalId,
			userId,
			'Recursion Fundamentals',
			-15,
			'QUIZ',
			'Detected foundational gap in call stack unwind behavior during DFS practice.',
			'DEVELOPING'
		);

		// 2. Trigger dynamic roadmap adaptation
		const { roadmap, adaptiveEvent } = RoadmapService.adaptRoadmap(
			goalId,
			userId,
			'Recursion & DFS Call Stack',
			'User struggled with recursive call stack frames during DFS traversal. Injected prerequisite refresher and rescheduled Dijkstra.'
		);

		// 3. Regenerate Daily Plan to reflect adapted priorities
		const today = new Date().toISOString().split('T')[0];
		const plan = DailyPlanService.getOrCreateDailyPlan(goalId, userId);
		plan.items = [
			{
				id: `item-adapt-1`,
				order: 1,
				title: 'Recursion Call Stack Refresher',
				conceptName: 'Recursion Fundamentals',
				estimatedMinutes: 15,
				type: 'REVIEW',
				status: 'PENDING',
				whyReason: 'Detected gap in recursion call stack dynamics during recent DFS quiz. Essential prerequisite for traversal algorithms.'
			},
			{
				id: `item-adapt-2`,
				order: 2,
				title: 'DFS Stack Visualization & 2 Guided Problems',
				conceptName: 'Depth-First Search (DFS)',
				estimatedMinutes: 20,
				type: 'PRACTICE',
				status: 'PENDING',
				whyReason: 'Replaces abstract reading with guided step-by-step code drills.'
			},
			{
				id: `item-adapt-3`,
				order: 3,
				title: 'Flashcard Recall: Graph Invariants',
				estimatedMinutes: 10,
				type: 'FLASHCARDS',
				status: 'PENDING',
				whyReason: 'Daily spaced repetition for long-term retention.'
			}
		];
		plan.summary = 'Plan adapted! Today’s focus shifted to securing Recursion fundamentals before advancing.';
		plan.weakAreaFocus = 'Recursion Fundamentals & DFS';
		dbStore.saveDailyPlan(plan);

		return {
			roadmap,
			adaptiveEvent,
			updatedConceptState
		};
	}
}
