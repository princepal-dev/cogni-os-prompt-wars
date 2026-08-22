// Knowledge Engine: Concept State Machine, Knowledge Graph & Timeline Tracker

import crypto from 'node:crypto';
import { dbStore } from '../db/store';
import type {
	KnowledgeConcept,
	KnowledgeState,
	KnowledgeTimelineEvent,
	ConceptStateType
} from '$lib/types/domain';

export class KnowledgeService {
	// Transition state and record timeline event
	public static updateConceptState(
		goalId: string,
		userId: string,
		conceptNameOrId: string,
		scoreDelta: number,
		triggerType: 'DIAGNOSTIC' | 'QUIZ' | 'TEACH_BACK' | 'PRACTICE' | 'NOTE' | 'SPACED_DECAY' | 'MANUAL',
		reason: string,
		overrideState?: ConceptStateType
	): KnowledgeState {
		let state = dbStore.getKnowledgeStateByConcept(conceptNameOrId, goalId, userId);
		const concept = dbStore.getConcepts(goalId).find(
			(c) => c.id === conceptNameOrId || c.name.toLowerCase() === conceptNameOrId.toLowerCase()
		);

		if (!state) {
			const newConceptId = concept?.id || `c-${crypto.randomUUID().slice(0, 8)}`;
			const conceptName = concept?.name || conceptNameOrId;
			if (!concept) {
				const newConcept: KnowledgeConcept = {
					id: newConceptId,
					goalId,
					name: conceptName,
					slug: conceptName.toLowerCase().replace(/\s+/g, '-'),
					category: 'Concepts',
					description: `Core concept: ${conceptName}`,
					importance: 'CORE',
					estimatedHoursToLearn: 2,
					prerequisites: [],
					subconcepts: []
				};
				dbStore.saveConcepts([newConcept]);
			}

			state = {
				id: crypto.randomUUID(),
				conceptId: newConceptId,
				conceptName,
				goalId,
				userId,
				state: 'UNKNOWN',
				masteryScore: 0,
				recallStrength: 100,
				lastAssessedAt: new Date().toISOString(),
				reviewDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
				timesReviewed: 0,
				timesPracticed: 0,
				errorFrequency: 0,
				recentMisconceptions: [],
				notesCount: 0
			};
		}

		const prevState = state.state;
		const prevMastery = state.masteryScore;

		// Calculate new mastery score bounded [0, 100]
		state.masteryScore = Math.max(0, Math.min(100, state.masteryScore + scoreDelta));
		state.lastAssessedAt = new Date().toISOString();

		if (triggerType === 'PRACTICE' || triggerType === 'QUIZ') {
			state.timesPracticed += 1;
		}
		if (triggerType === 'QUIZ' && scoreDelta < 0) {
			state.errorFrequency += 1;
		}

		// Calculate next state based on score & threshold
		if (overrideState) {
			state.state = overrideState;
		} else {
			if (state.masteryScore >= 90) state.state = 'MASTERED';
			else if (state.masteryScore >= 75) state.state = 'STRONG';
			else if (state.masteryScore >= 55) state.state = 'PRACTICING';
			else if (state.masteryScore >= 35) state.state = 'DEVELOPING';
			else if (state.masteryScore >= 15) state.state = 'LEARNING';
			else if (state.masteryScore > 0) state.state = 'INTRODUCED';
			else state.state = 'UNKNOWN';
		}

		dbStore.saveKnowledgeState(state);

		// Record timeline event
		const event: KnowledgeTimelineEvent = {
			id: crypto.randomUUID(),
			conceptId: state.conceptId,
			conceptName: state.conceptName,
			goalId,
			userId,
			previousState: prevState,
			newState: state.state,
			previousMastery: prevMastery,
			newMastery: state.masteryScore,
			triggerType,
			reason,
			timestamp: new Date().toISOString()
		};
		dbStore.addTimelineEvent(event);

		return state;
	}

	// Get all concepts with their current knowledge states
	public static getConceptStates(goalId: string, userId: string) {
		const concepts = dbStore.getConcepts(goalId);
		const states = dbStore.getKnowledgeStates(goalId, userId);

		return concepts.map((concept) => {
			const state = states.find((s) => s.conceptId === concept.id) || {
				id: '',
				conceptId: concept.id,
				conceptName: concept.name,
				goalId,
				userId,
				state: 'UNKNOWN' as ConceptStateType,
				masteryScore: 0,
				recallStrength: 100,
				lastAssessedAt: '',
				reviewDueAt: '',
				timesReviewed: 0,
				timesPracticed: 0,
				errorFrequency: 0,
				recentMisconceptions: [],
				notesCount: 0
			};

			return {
				concept,
				state
			};
		});
	}

	// Calculate knowledge graph for visualization
	public static getKnowledgeGraph(goalId: string, userId: string) {
		const concepts = dbStore.getConcepts(goalId);
		const states = dbStore.getKnowledgeStates(goalId, userId);

		const nodes = concepts.map((c) => {
			const st = states.find((s) => s.conceptId === c.id);
			return {
				id: c.id,
				name: c.name,
				category: c.category,
				importance: c.importance,
				state: st?.state || 'UNKNOWN',
				masteryScore: st?.masteryScore || 0
			};
		});

		const edges: { source: string; target: string; label: string }[] = [];
		for (const c of concepts) {
			for (const prereq of c.prerequisites) {
				const parent = concepts.find((p) => p.name.toLowerCase() === prereq.toLowerCase() || p.id === prereq);
				if (parent) {
					edges.push({
						source: parent.id,
						target: c.id,
						label: 'prerequisite'
					});
				}
			}
		}

		return { nodes, edges };
	}
}
