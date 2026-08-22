// Curated Learning Resources with "Why?" Justification

import crypto from 'node:crypto';
import { dbStore } from '../db/store';
import type { CuratedResource } from '$lib/types/domain';

export class RecommendationService {
	public static getCuratedResources(goalId: string): CuratedResource[] {
		let resources = dbStore.getResources(goalId);
		if (resources.length === 0) {
			resources = RecommendationService.seedResources(goalId);
		}
		return resources;
	}

	public static seedResources(goalId: string): CuratedResource[] {
		const resources: CuratedResource[] = [
			{
				id: crypto.randomUUID(),
				goalId,
				conceptName: 'Breadth-First Search (BFS)',
				title: 'BFS Graph Traversal Algorithm with Queue Visualization',
				type: 'YOUTUBE_VIDEO',
				url: 'https://www.youtube.com/watch?v=oDqjPvD54Ss',
				durationMinutes: 18,
				level: 'BEGINNER',
				rating: 4.9,
				whyRecommended: [
					'Matches your preference for visual explanations',
					'Covers your current BFS level-order knowledge gap',
					'18 minutes: fits today’s available 45-minute study block',
					'Includes animated queue state transitions'
				]
			},
			{
				id: crypto.randomUUID(),
				goalId,
				conceptName: 'Depth-First Search (DFS)',
				title: 'DFS Recursion & Backtracking Deep Dive',
				type: 'YOUTUBE_VIDEO',
				url: 'https://www.youtube.com/watch?v=7fujbpJ0LB4',
				durationMinutes: 24,
				level: 'INTERMEDIATE',
				rating: 4.8,
				whyRecommended: [
					'Step-by-step call stack diagram for recursive tree branches',
					'Direct prerequisite for Topological Sort in Week 3',
					'Includes 3 practical cycle detection interview questions'
				]
			},
			{
				id: crypto.randomUUID(),
				goalId,
				conceptName: 'Breadth-First Search (BFS)',
				title: 'LeetCode 994: Rotting Oranges (Multi-source BFS)',
				type: 'PRACTICE_PROBLEM',
				url: 'https://leetcode.com/problems/rotting-oranges/',
				durationMinutes: 25,
				level: 'INTERMEDIATE',
				rating: 4.9,
				whyRecommended: [
					'High-frequency interview question tested at Google, Meta, Amazon',
					'Builds on 2D grid matrix traversals with level time simulation',
					'Reinforces your hands-on coding preference'
				]
			},
			{
				id: crypto.randomUUID(),
				goalId,
				conceptName: 'Dijkstra & Shortest Paths',
				title: 'Dijkstra’s Algorithm with Priority Queue (Min-Heap)',
				type: 'ARTICLE',
				url: 'https://cp-algorithms.com/graph/dijkstra.html',
				durationMinutes: 15,
				level: 'INTERMEDIATE',
				rating: 4.7,
				whyRecommended: [
					'Clear mathematical invariant explanation of why greedy relaxation works',
					'Contrasts space & time complexity with Bellman-Ford'
				]
			}
		];

		dbStore.saveResources(resources);
		return resources;
	}
}
