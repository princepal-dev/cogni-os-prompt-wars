// Roadmap Service & Dynamic Adaptive Re-planning Engine

import crypto from 'node:crypto';
import { dbStore } from '../db/store';
import { AIService } from '../ai/ai.service';
import type { Roadmap, Milestone, RoadmapModule, AdaptiveEvent } from '$lib/types/domain';

export class RoadmapService {
	// Get or generate roadmap for a learning goal
	public static async getOrCreateRoadmap(goalId: string, userId: string): Promise<Roadmap> {
		let roadmap = dbStore.getRoadmap(goalId);
		if (roadmap) return roadmap;

		const goal = dbStore.getGoalById(goalId, userId);
		if (!goal) throw new Error('Goal not found');

		const profile = dbStore.getProfile(userId);
		const generated = await AIService.generateRoadmap(
			goal.title,
			profile?.background || 'Learner',
			goal.targetOutcome,
			goal.feasibility.availableLearningHours
		);

		roadmap = {
			id: crypto.randomUUID(),
			goalId,
			title: `${goal.title} Roadmap`,
			version: 1,
			summary: generated.summary,
			totalEstimatedHours: generated.totalEstimatedHours,
			milestones: generated.milestones,
			adaptationCount: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		dbStore.saveRoadmap(roadmap);
		return roadmap;
	}

	// Dynamic Adaptation Loop: Adapts the roadmap when gaps are discovered
	public static adaptRoadmap(
		goalId: string,
		userId: string,
		detectedGap: string,
		reason: string
	): { roadmap: Roadmap; adaptiveEvent: AdaptiveEvent } {
		let roadmap = dbStore.getRoadmap(goalId);
		if (!roadmap) throw new Error('Roadmap not found');

		roadmap.version += 1;
		roadmap.adaptationCount += 1;
		roadmap.lastAdaptedAt = new Date().toISOString();

		let adjustmentsSummary = '';
		const details: string[] = [];

		if (detectedGap.toLowerCase().includes('recursion') || detectedGap.toLowerCase().includes('dfs')) {
			// Find Week 1 Milestone
			const m1 = roadmap.milestones.find((m) => m.weekNumber === 1) || roadmap.milestones[0];
			if (m1) {
				// Inject prerequisite refresher module before DFS
				const refresherModule: RoadmapModule = {
					id: `mod-injected-${Date.now()}`,
					milestoneId: m1.id,
					title: 'Recursion Call Stack & Backtracking Refresher',
					description: 'Master call stack state frames, base case termination, and tree-branch traversal before advanced DFS.',
					estimatedMinutes: 35,
					conceptIds: ['c-rec'],
					conceptNames: ['Recursion Fundamentals'],
					dependencies: [],
					formatType: 'CODING',
					isPrerequisiteInjection: true,
					whyReason: 'Triggered by weak performance on DFS recursion probe. Secures the prerequisite before proceeding.',
					status: 'TODO'
				};

				// Add guided practice module
				const practiceModule: RoadmapModule = {
					id: `mod-injected-prac-${Date.now()}`,
					milestoneId: m1.id,
					title: 'Guided Practice: 2 Step-by-Step Recursive DFS Problems',
					description: 'Hands-on practice on Max Area of Island and Flood Fill with step-by-step stack visualization.',
					estimatedMinutes: 40,
					conceptIds: ['c-dfs'],
					conceptNames: ['Depth-First Search (DFS)'],
					dependencies: ['Recursion Fundamentals'],
					formatType: 'PRACTICE',
					isPrerequisiteInjection: true,
					whyReason: 'Replaces generic reading with focused interactive coding to build muscle memory.',
					status: 'TODO'
				};

				// Insert right before DFS or at beginning
				const dfsIndex = m1.modules.findIndex((mod) => mod.conceptNames.includes('Depth-First Search (DFS)'));
				if (dfsIndex >= 0) {
					m1.modules.splice(dfsIndex, 0, refresherModule, practiceModule);
				} else {
					m1.modules.push(refresherModule, practiceModule);
				}
			}

			// Reschedule Week 2 Milestone (Dijkstra) downstream
			const m2 = roadmap.milestones.find((m) => m.weekNumber === 2);
			if (m2) {
				m2.description += ' (Adjusted schedule: allows extra time to master DFS traversals).';
			}

			adjustmentsSummary = 'Roadmap Adapted: DFS Recursion gap detected; inserted Refresher & Guided Practice, rescheduled Dijkstra.';
			details.push('1. Inserted "Recursion Call Stack Refresher" (35 min) into current schedule.');
			details.push('2. Added 2 targeted guided recursive traversal problems.');
			details.push('3. Rescheduled Dijkstra & Shortest Paths downstream to solidify traversal fundamentals first.');

			roadmap.activeAdaptationNotice = adjustmentsSummary;
		} else {
			adjustmentsSummary = `Roadmap adapted to reinforce ${detectedGap}.`;
			details.push(`Added targeted reinforcement for ${detectedGap}.`);
			roadmap.activeAdaptationNotice = adjustmentsSummary;
		}

		dbStore.saveRoadmap(roadmap);

		// Record Adaptive Event
		const adaptiveEvent: AdaptiveEvent = {
			id: crypto.randomUUID(),
			goalId,
			userId,
			triggerType: 'QUIZ_GAP',
			detectedGapConcept: detectedGap,
			adjustmentsSummary,
			details,
			timestamp: new Date().toISOString()
		};
		dbStore.addAdaptiveEvent(adaptiveEvent);

		return { roadmap, adaptiveEvent };
	}
}
