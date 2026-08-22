// Teach-Back ("Teach Me") Socratic Evaluation Service

import crypto from 'node:crypto';
import { dbStore } from '../db/store';
import { AIService } from '../ai/ai.service';
import { KnowledgeService } from './knowledge.service';
import type { TeachBackSession } from '$lib/types/domain';
import type { TeachBackSubmissionRequest } from '$lib/types/api';

export class TeachBackService {
	// Evaluate Teach-Back explanation and update knowledge state
	public static async evaluateTeachBack(
		userId: string,
		req: TeachBackSubmissionRequest
	): Promise<TeachBackSession> {
		const stateBefore = dbStore.getKnowledgeStateByConcept(req.conceptName, req.goalId, userId);
		const conceptStateBefore = stateBefore?.state || 'LEARNING';

		const evaluation = await AIService.evaluateTeachBack(req.conceptName, req.userExplanation);

		// Update concept knowledge state
		const scoreDelta = evaluation.score >= 75 ? +20 : evaluation.score >= 50 ? +5 : -10;
		const updatedState = KnowledgeService.updateConceptState(
			req.goalId,
			userId,
			req.conceptName,
			scoreDelta,
			'TEACH_BACK',
			`Teach-Back score: ${evaluation.score}/100 (Clarity: ${evaluation.clarityScore}, Correctness: ${evaluation.correctnessScore})`,
			evaluation.recommendedState
		);

		const session: TeachBackSession = {
			id: crypto.randomUUID(),
			goalId: req.goalId,
			userId,
			conceptId: stateBefore?.conceptId || 'concept-id',
			conceptName: req.conceptName,
			promptScenario: req.promptScenario,
			userExplanation: req.userExplanation,
			score: evaluation.score,
			clarityScore: evaluation.clarityScore,
			depthScore: evaluation.depthScore,
			correctnessScore: evaluation.correctnessScore,
			strengths: evaluation.strengths,
			missingConcepts: evaluation.missingConcepts,
			misconceptions: evaluation.misconceptions,
			feedback: evaluation.feedback,
			conceptStateBefore,
			conceptStateAfter: updatedState.state,
			createdAt: new Date().toISOString()
		};

		dbStore.saveTeachBackSession(session);
		return session;
	}

	// Get past teach-back sessions for a goal
	public static getSessions(goalId: string, userId: string): TeachBackSession[] {
		return dbStore.getTeachBackSessions(goalId, userId);
	}
}
