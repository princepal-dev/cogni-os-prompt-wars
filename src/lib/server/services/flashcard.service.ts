// Spaced Repetition Flashcard Service (SuperMemo SM-2 Algorithm)

import crypto from 'node:crypto';
import { dbStore } from '../db/store';
import { KnowledgeService } from './knowledge.service';
import type { Flashcard } from '$lib/types/domain';

export class FlashcardService {
	// Get flashcards due for review
	public static getDueFlashcards(goalId: string, userId: string): Flashcard[] {
		let flashcards = dbStore.getFlashcards(goalId, userId);
		if (flashcards.length === 0) {
			flashcards = FlashcardService.seedInitialFlashcards(goalId, userId);
		}
		const today = new Date().toISOString().split('T')[0];
		return flashcards.filter((f) => f.nextReviewDate <= today);
	}

	// Get all flashcards for a goal
	public static getAllFlashcards(goalId: string, userId: string): Flashcard[] {
		let flashcards = dbStore.getFlashcards(goalId, userId);
		if (flashcards.length === 0) {
			flashcards = FlashcardService.seedInitialFlashcards(goalId, userId);
		}
		return flashcards;
	}

	// Review flashcard with SM-2 spaced repetition calculation
	public static reviewCard(flashcardId: string, userId: string, rating: 1 | 2 | 3 | 4): Flashcard {
		const card = dbStore.getFlashcardById(flashcardId, userId);
		if (!card) throw new Error('Flashcard not found');

		// SM-2 algorithm variables
		let { easeFactor, repetitions, intervalDays } = card;
		// easeFactor stored as integer * 100 (e.g. 250 = 2.5)
		let ef = easeFactor / 100;

		if (rating >= 3) {
			if (repetitions === 0) {
				intervalDays = 1;
			} else if (repetitions === 1) {
				intervalDays = 6;
			} else {
				intervalDays = Math.round(intervalDays * ef);
			}
			repetitions += 1;
		} else {
			// Failed recall
			repetitions = 0;
			intervalDays = 1;
		}

		// Calculate new ease factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
		const grade = rating + 1; // map 1-4 to 2-5 for SM2 formula
		ef = Math.max(1.3, ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

		const nextDate = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

		card.easeFactor = Math.round(ef * 100);
		card.repetitions = repetitions;
		card.intervalDays = intervalDays;
		card.nextReviewDate = nextDate;
		card.lastReviewedAt = new Date().toISOString();

		dbStore.saveFlashcard(card);

		// Reinforce concept state
		const delta = rating >= 3 ? +4 : -4;
		KnowledgeService.updateConceptState(
			card.goalId,
			userId,
			card.conceptName,
			delta,
			'SPACED_DECAY',
			`Flashcard recall rated: ${rating}/4 (Next review in ${intervalDays} days)`
		);

		return card;
	}

	// Seed default flashcards
	public static seedInitialFlashcards(goalId: string, userId: string): Flashcard[] {
		const today = new Date().toISOString().split('T')[0];
		const cards: Flashcard[] = [
			{
				id: crypto.randomUUID(),
				goalId,
				userId,
				conceptName: 'Breadth-First Search (BFS)',
				source: 'CONCEPT',
				front: 'What abstract data structure is used to maintain order in BFS, and why?',
				back: 'A Queue (FIFO) is used so that vertices are explored level by level in order of distance from the source.',
				intervalDays: 1,
				easeFactor: 250,
				repetitions: 0,
				nextReviewDate: today,
				createdAt: new Date().toISOString()
			},
			{
				id: crypto.randomUUID(),
				goalId,
				userId,
				conceptName: 'Depth-First Search (DFS)',
				source: 'CONCEPT',
				front: 'What is the standard time and space complexity of recursive DFS on an Adjacency List?',
				back: 'Time: O(V + E)\nSpace: O(V) in the worst case for the recursion call stack.',
				intervalDays: 1,
				easeFactor: 250,
				repetitions: 0,
				nextReviewDate: today,
				createdAt: new Date().toISOString()
			},
			{
				id: crypto.randomUUID(),
				goalId,
				userId,
				conceptName: 'Dijkstra & Shortest Paths',
				source: 'QUIZ_MISTAKE',
				front: 'Under what condition does Dijkstra fail to find the shortest path?',
				back: 'When edges have negative weights or negative cycles, because Dijkstra greedily assumes finalized distances cannot decrease.',
				intervalDays: 1,
				easeFactor: 250,
				repetitions: 0,
				nextReviewDate: today,
				createdAt: new Date().toISOString()
			},
			{
				id: crypto.randomUUID(),
				goalId,
				userId,
				conceptName: 'Graph Representation',
				source: 'CONCEPT',
				front: 'What is the space complexity difference between an Adjacency Matrix and an Adjacency List?',
				back: 'Adjacency Matrix: O(V²)\nAdjacency List: O(V + E)',
				intervalDays: 1,
				easeFactor: 250,
				repetitions: 0,
				nextReviewDate: today,
				createdAt: new Date().toISOString()
			}
		];

		dbStore.saveFlashcards(cards);
		return cards;
	}
}
