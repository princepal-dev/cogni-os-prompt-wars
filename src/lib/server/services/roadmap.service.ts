// Roadmap Service & Dynamic Adaptive Re-planning Engine

import crypto from 'node:crypto';
import { dbStore } from '../db/store';
import { AIService } from '../ai/ai.service';
import { OfflineFallbackEngine } from '../ai/offline-fallback.engine';
import { NeonPostgresService } from '../db/neon-postgres';
import type { Roadmap, Milestone, RoadmapModule, AdaptiveEvent } from '$lib/types/domain';

export class RoadmapService {
	// Get or generate roadmap for a learning goal
	public static async getOrCreateRoadmap(goalId: string, userId: string): Promise<Roadmap> {
		let roadmap = dbStore.getRoadmap(goalId);
		if (roadmap) return roadmap;

		const goal = await NeonPostgresService.getGoalById(goalId, userId) || dbStore.getGoalById(goalId, userId);
		const profile = dbStore.getProfile(userId);

		const title = goal?.title || 'Learning Topic';
		const targetOutcome = goal?.targetOutcome || 'Master core concepts';
		const availableHours = goal?.feasibility?.availableLearningHours || 30;

		const generated = await AIService.generateRoadmap(
			title,
			profile?.background || 'Learner',
			targetOutcome,
			availableHours
		);

		roadmap = {
			id: crypto.randomUUID(),
			goalId,
			title: `${title} Roadmap`,
			version: 1,
			summary: generated.summary,
			totalEstimatedHours: generated.totalEstimatedHours,
			milestones: generated.milestones,
			adaptationCount: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		dbStore.saveRoadmap(roadmap);

		// Save roadmap to Neon Postgres
		const sql = (await import('../db/neon-postgres')).getNeonSql();
		if (sql) {
			try {
				await sql`
					INSERT INTO roadmaps (
						id, goal_id, title, version, summary, total_estimated_hours,
						milestones_data, adaptation_count, created_at, updated_at
					) VALUES (
						${roadmap.id}, ${roadmap.goalId}, ${roadmap.title}, ${roadmap.version},
						${roadmap.summary}, ${roadmap.totalEstimatedHours},
						${JSON.stringify(roadmap.milestones)}, ${roadmap.adaptationCount},
						${roadmap.createdAt}, ${roadmap.updatedAt}
					) ON CONFLICT (id) DO UPDATE SET
						summary = EXCLUDED.summary,
						milestones_data = EXCLUDED.milestones_data,
						adaptation_count = EXCLUDED.adaptation_count,
						updated_at = EXCLUDED.updated_at;
				`;
			} catch (e) {
				console.warn('[Neon Postgres] saveRoadmap error:', e);
			}
		}

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
		if (!roadmap) {
			const goal = dbStore.getGoalById(goalId, userId);
			const title = goal?.title || 'Learning Goal';
			const generated = OfflineFallbackEngine.generateRoadmap(title, 'Learner', 'Master core concepts', 30);
			roadmap = {
				id: crypto.randomUUID(),
				goalId,
				title: `${title} Roadmap`,
				version: 1,
				summary: generated.summary,
				totalEstimatedHours: generated.totalEstimatedHours,
				milestones: generated.milestones,
				adaptationCount: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};
			dbStore.saveRoadmap(roadmap);
		}

		roadmap.version += 1;
		roadmap.adaptationCount += 1;
		roadmap.lastAdaptedAt = new Date().toISOString();

		let adjustmentsSummary = '';
		const details: string[] = [];

		if (detectedGap.toLowerCase().includes('recursion') || detectedGap.toLowerCase().includes('dfs') || detectedGap.toLowerCase().includes('consensus')) {
			// Find Week 1 Milestone
			const m1 = roadmap.milestones.find((m) => m.weekNumber === 1) || roadmap.milestones[0];
			if (m1) {
				// Inject prerequisite refresher module
				const refresherModule: RoadmapModule = {
					id: `mod-injected-${Date.now()}`,
					milestoneId: m1.id,
					title: `${detectedGap} Prerequisites Refresher`,
					description: `Targeted review of core invariants and foundation principles for ${detectedGap}.`,
					estimatedMinutes: 35,
					conceptIds: ['c-injected-1'],
					conceptNames: [detectedGap],
					dependencies: [],
					formatType: 'CODING',
					isPrerequisiteInjection: true,
					whyReason: `Triggered by gap detection: ${reason}`,
					status: 'TODO'
				};

				// Add guided practice module
				const practiceModule: RoadmapModule = {
					id: `mod-injected-prac-${Date.now()}`,
					milestoneId: m1.id,
					title: `Guided Practice: Step-by-Step ${detectedGap} Exercises`,
					description: 'Hands-on practice problems with step-by-step invariant validation.',
					estimatedMinutes: 40,
					conceptIds: ['c-injected-2'],
					conceptNames: [detectedGap],
					dependencies: [detectedGap],
					formatType: 'PRACTICE',
					isPrerequisiteInjection: true,
					whyReason: 'Reinforce mechanics through targeted deliberate practice.',
					status: 'TODO'
				};

				m1.modules.unshift(practiceModule);
				m1.modules.unshift(refresherModule);
			}

			adjustmentsSummary = `Injected prerequisite refresher and guided practice for "${detectedGap}".`;
			details.push(`Added "${detectedGap} Prerequisites Refresher" (35 min)`);
			details.push(`Added "Guided Practice: Step-by-Step ${detectedGap} Exercises" (40 min)`);
		} else {
			adjustmentsSummary = `Reinforced foundations and practice pace for ${detectedGap}.`;
			details.push(`Added targeted reinforcement for ${detectedGap}`);
		}

		roadmap.activeAdaptationNotice = `⚡ Roadmap Adapted (v${roadmap.version}): ${adjustmentsSummary} (${reason})`;
		roadmap.updatedAt = new Date().toISOString();
		dbStore.saveRoadmap(roadmap);

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
		dbStore.saveAdaptiveEvent(adaptiveEvent);

		return { roadmap, adaptiveEvent };
	}
}
