// Daily Plan Service: "What should I do right now?" Engine

import crypto from 'node:crypto';
import { dbStore } from '../db/store';
import type { DailyPlan, DailyPlanItem } from '$lib/types/domain';

export class DailyPlanService {
	// Get or generate today's plan for a goal
	public static getOrCreateDailyPlan(goalId: string, userId: string): DailyPlan {
		const today = new Date().toISOString().split('T')[0];
		let plan = dbStore.getDailyPlan(goalId, userId, today);
		if (plan) return plan;

		const goal = dbStore.getGoalById(goalId, userId);
		if (!goal) throw new Error('Goal not found');

		const states = dbStore.getKnowledgeStates(goalId, userId);
		const flashcards = dbStore.getFlashcards(goalId, userId);
		const availableMins = goal.dailyMinutesBudget || 45;

		const items: DailyPlanItem[] = [];

		// 1. Spaced Review (if any concept is DEVELOPING or NEEDS_REVIEW)
		const reviewConcept = states.find((s) => s.state === 'NEEDS_REVIEW' || s.state === 'DEVELOPING') || states.find((s) => s.conceptName.includes('BFS'));
		if (reviewConcept) {
			items.push({
				id: `item-${crypto.randomUUID().slice(0, 6)}`,
				order: 1,
				title: `Review ${reviewConcept.conceptName}`,
				conceptName: reviewConcept.conceptName,
				estimatedMinutes: 10,
				type: 'REVIEW',
				status: 'PENDING',
				whyReason: `Your recall for ${reviewConcept.conceptName} was evaluated recently and needs consolidation to reach strong mastery.`
			});
		}

		// 2. Core Learning Item (from active concept)
		const learningConcept = states.find((s) => s.state === 'LEARNING' || s.state === 'INTRODUCED') || states.find((s) => s.conceptName.includes('DFS')) || states[0];
		if (learningConcept) {
			items.push({
				id: `item-${crypto.randomUUID().slice(0, 6)}`,
				order: 2,
				title: `Learn ${learningConcept.conceptName} traversal mechanics`,
				conceptName: learningConcept.conceptName,
				estimatedMinutes: 15,
				type: 'LEARN',
				status: 'PENDING',
				whyReason: `Active milestone focus in your personalized roadmap.`
			});
		}

		// 3. Hands-on Practice
		items.push({
			id: `item-${crypto.randomUUID().slice(0, 6)}`,
			order: 3,
			title: 'Solve 2 targeted coding problems',
			conceptName: learningConcept ? learningConcept.conceptName : 'Graph Traversals',
			estimatedMinutes: 15,
			type: 'PRACTICE',
			status: 'PENDING',
			whyReason: 'Hands-on problem solving matches your preference for coding exercises.'
		});

		// 4. Flashcards Recall
		items.push({
			id: `item-${crypto.randomUUID().slice(0, 6)}`,
			order: 4,
			title: 'Recall 5 daily flashcards',
			estimatedMinutes: 5,
			type: 'FLASHCARDS',
			status: 'PENDING',
			whyReason: 'Spaced repetition to lock key invariants into long-term memory.'
		});

		plan = {
			id: crypto.randomUUID(),
			goalId,
			userId,
			date: today,
			availableMinutes: availableMins,
			items,
			summary: `Good morning! You have ${availableMins} minutes allocated today for ${goal.title}.`,
			weakAreaFocus: reviewConcept ? reviewConcept.conceptName : undefined,
			isOnTrack: true,
			progressPercentage: 0,
			createdAt: new Date().toISOString()
		};

		dbStore.saveDailyPlan(plan);
		return plan;
	}

	// Update item status in daily plan
	public static toggleItemStatus(goalId: string, userId: string, itemId: string, completed: boolean): DailyPlan {
		const today = new Date().toISOString().split('T')[0];
		let plan = dbStore.getDailyPlan(goalId, userId, today);
		if (!plan) {
			plan = DailyPlanService.getOrCreateDailyPlan(goalId, userId);
		}

		const item = plan.items.find((i) => i.id === itemId);
		if (item) {
			item.status = completed ? 'COMPLETED' : 'PENDING';
		}

		const completedCount = plan.items.filter((i) => i.status === 'COMPLETED').length;
		plan.progressPercentage = Math.round((completedCount / plan.items.length) * 100);

		dbStore.saveDailyPlan(plan);
		return plan;
	}
}
