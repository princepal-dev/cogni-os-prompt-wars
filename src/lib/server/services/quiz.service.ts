// Adaptive Quiz Service: Concept-Aware Assessment & Misconception Analysis

import crypto from 'node:crypto';
import { dbStore } from '../db/store';
import { KnowledgeService } from './knowledge.service';
import type { Quiz, QuizQuestion, QuizAttempt, ConceptStateType } from '$lib/types/domain';

export class QuizService {
	// Generate an adaptive quiz for a learning goal
	public static generateQuiz(goalId: string, userId: string, mode: 'QUICK' | 'CONCEPT' | 'WEAK_AREA' | 'REVISION' | 'EXAM'): Quiz {
		const states = dbStore.getKnowledgeStates(goalId, userId);
		const weakConcepts = states.filter((s) => s.state === 'LEARNING' || s.state === 'DEVELOPING' || s.state === 'NEEDS_REVIEW');
		const strongConcepts = states.filter((s) => s.state === 'STRONG' || s.state === 'MASTERED');

		const questions: QuizQuestion[] = [];

		// Question 1: BFS Traversal (Developing area)
		questions.push({
			id: `qq-bfs-${crypto.randomUUID().slice(0, 4)}`,
			conceptId: 'c-bfs',
			conceptName: 'Breadth-First Search (BFS)',
			questionText: 'In a graph with unweighted edges, why does BFS guarantee finding the shortest path between start and target?',
			questionType: 'MULTIPLE_CHOICE',
			options: [
				'BFS expands uniformly layer-by-layer; any node encountered at layer K cannot have a path shorter than K.',
				'BFS uses a min-heap to sort edges by weight dynamically.',
				'Because BFS backtracks upon reaching dead ends.',
				'BFS visits vertices in alphabetical or index order.'
			],
			correctOptionIndex: 0,
			explanation: 'Layer-by-layer (FIFO queue) traversal guarantees the first time a vertex is popped, the shortest unweighted distance is achieved.',
			difficulty: 'INTERMEDIATE'
		});

		// Question 2: DFS & Recursion Call Stack (High priority / Weak area probe)
		questions.push({
			id: `qq-dfs-${crypto.randomUUID().slice(0, 4)}`,
			conceptId: 'c-dfs',
			conceptName: 'Depth-First Search (DFS)',
			questionText: 'What is the consequence of omitting the "visited" set check in a recursive DFS traversal of an undirected cyclic graph?',
			questionType: 'CONCEPT_EXPLANATION',
			options: [
				'Infinite recursion leading to a Call Stack Overflow exception.',
				'The traversal will terminate too early.',
				'The time complexity improves to O(V).',
				'The output order will automatically be topological.'
			],
			correctOptionIndex: 0,
			explanation: 'In cyclic graphs, visiting an adjacent node without checking visited will recursively call the parent node again, causing infinite recursion.',
			difficulty: 'BEGINNER'
		});

		// Question 3: Shortest Path & Dijkstra Greedy Invariant
		questions.push({
			id: `qq-dijkstra-${crypto.randomUUID().slice(0, 4)}`,
			conceptId: 'c-dijkstra',
			conceptName: 'Dijkstra & Shortest Paths',
			questionText: 'Why does Dijkstra’s algorithm produce incorrect shortest paths in graphs with negative edge weights?',
			questionType: 'MULTIPLE_CHOICE',
			options: [
				'Dijkstra greedily marks a node as finalized once extracted from the priority queue, assuming no future edge could reduce its distance.',
				'Because Priority Queues in standard libraries throw runtime exceptions on negative numbers.',
				'Dijkstra only works on tree data structures.',
				'Negative edges invert the directed nature of graph edges.'
			],
			correctOptionIndex: 0,
			explanation: 'The greedy choice property in Dijkstra relies on edge weights being >= 0. Negative edges violate the assumption that settled distances are optimal.',
			difficulty: 'INTERMEDIATE'
		});

		// Question 4: Graph Representation Space Trade-offs
		questions.push({
			id: `qq-rep-${crypto.randomUUID().slice(0, 4)}`,
			conceptId: 'c-rep',
			conceptName: 'Graph Representation',
			questionText: 'For a graph with 10,000 vertices and only 20,000 edges, which representation is vastly superior in memory usage?',
			questionType: 'MULTIPLE_CHOICE',
			options: [
				'Adjacency List (~O(V + E) = 30k elements vs Matrix O(V²) = 100M elements)',
				'Adjacency Matrix (uses 100M entries to allow O(1) edge lookup regardless of memory)',
				'Adjacency Matrix uses less memory because it uses booleans',
				'Both use identical memory space'
			],
			correctOptionIndex: 0,
			explanation: 'Adjacency list uses O(V + E) space, which requires negligible memory compared to the 100,000,000 entries of an Adjacency Matrix.',
			difficulty: 'BEGINNER'
		});

		const quiz: Quiz = {
			id: crypto.randomUUID(),
			goalId,
			title: `${mode.replace('_', ' ')} Quiz: Graph Algorithms`,
			mode,
			targetConceptNames: ['Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Dijkstra & Shortest Paths', 'Graph Representation'],
			questions,
			createdAt: new Date().toISOString()
		};

		dbStore.saveQuiz(quiz);
		return quiz;
	}

	// Submit quiz attempt, grade answers, and update knowledge states
	public static submitQuizAttempt(
		quizId: string,
		goalId: string,
		userId: string,
		userAnswers: { questionId: string; selectedOptionIndex: number }[]
	): QuizAttempt {
		const quiz = dbStore.getQuizById(quizId);
		if (!quiz) throw new Error('Quiz not found');

		let score = 0;
		const maxScore = quiz.questions.length;
		const answersWithResult = [];
		const conceptMap = new Map<string, { correct: number; total: number }>();
		const misconceptions: string[] = [];

		for (const q of quiz.questions) {
			const ans = userAnswers.find((a) => a.questionId === q.id);
			const isCorrect = ans !== undefined && ans.selectedOptionIndex === q.correctOptionIndex;
			if (isCorrect) score += 1;

			answersWithResult.push({
				questionId: q.id,
				selectedOptionIndex: ans?.selectedOptionIndex ?? -1,
				isCorrect
			});

			const cur = conceptMap.get(q.conceptName) || { correct: 0, total: 0 };
			cur.total += 1;
			if (isCorrect) cur.correct += 1;
			conceptMap.set(q.conceptName, cur);

			if (!isCorrect && ans !== undefined) {
				misconceptions.push(`Missed core invariant in ${q.conceptName}: ${q.explanation}`);
			}
		}

		const percentage = Math.round((score / maxScore) * 100);
		const conceptBreakdown: { conceptName: string; correctCount: number; totalCount: number; statusChangedTo?: ConceptStateType }[] = [];

		// Update knowledge state for each concept
		for (const [conceptName, { correct, total }] of conceptMap.entries()) {
			const isAllCorrect = correct === total;
			const delta = isAllCorrect ? +15 : -10;
			const updated = KnowledgeService.updateConceptState(
				goalId,
				userId,
				conceptName,
				delta,
				'QUIZ',
				`Quiz result: ${correct}/${total} correct (${percentage}%)`
			);

			conceptBreakdown.push({
				conceptName,
				correctCount: correct,
				totalCount: total,
				statusChangedTo: updated.state
			});
		}

		const attempt: QuizAttempt = {
			id: crypto.randomUUID(),
			quizId,
			goalId,
			userId,
			score,
			maxScore,
			percentage,
			userAnswers: answersWithResult,
			conceptBreakdown,
			misconceptions,
			feedback:
				percentage >= 80
					? 'Strong performance! You demonstrated thorough understanding of core graph invariants and traversal mechanics.'
					: 'Good effort! Review the missed concepts above and check the updated daily learning plan for targeted reinforcement.',
			timestamp: new Date().toISOString()
		};

		dbStore.saveQuizAttempt(attempt);
		return attempt;
	}
}
