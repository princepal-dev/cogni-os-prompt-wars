// Learning-Aware Task & Kanban Service

import crypto from 'node:crypto';
import { dbStore } from '../db/store';
import { KnowledgeService } from './knowledge.service';
import type { Task } from '$lib/types/domain';

export class TaskService {
	// Get tasks for a goal
	public static getTasks(goalId: string, userId: string): Task[] {
		let tasks = dbStore.getTasks(goalId, userId);
		if (tasks.length === 0) {
			tasks = TaskService.seedInitialTasks(goalId, userId);
		}
		return tasks;
	}

	// Create a learning-aware task
	public static createTask(
		goalId: string,
		userId: string,
		data: {
			title: string;
			description: string;
			conceptName?: string;
			estimatedMinutes?: number;
			type?: 'LEARN' | 'PRACTICE' | 'REVIEW' | 'QUIZ' | 'FLASHCARD';
			priority?: 'LOW' | 'MEDIUM' | 'HIGH';
			whyReason?: string;
		}
	): Task {
		const task: Task = {
			id: crypto.randomUUID(),
			goalId,
			userId,
			title: data.title.trim(),
			description: data.description.trim(),
			conceptName: data.conceptName,
			estimatedMinutes: data.estimatedMinutes || 20,
			type: data.type || 'PRACTICE',
			status: 'TODO',
			priority: data.priority || 'MEDIUM',
			whyReason: data.whyReason || 'Generated to address active learning milestone.',
			createdAt: new Date().toISOString()
		};

		dbStore.saveTask(task);
		return task;
	}

	// Move task across Kanban columns
	public static updateTaskStatus(
		taskId: string,
		userId: string,
		status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'
	): Task {
		const tasks = dbStore.getTasks('', userId); // find across user tasks
		const task = tasks.find((t) => t.id === taskId);
		if (!task) throw new Error('Task not found');

		const prevStatus = task.status;
		task.status = status;

		if (status === 'COMPLETED' && prevStatus !== 'COMPLETED') {
			task.completedAt = new Date().toISOString();
			// Reinforce concept knowledge state
			if (task.conceptName) {
				KnowledgeService.updateConceptState(
					task.goalId,
					userId,
					task.conceptName,
					+5,
					'PRACTICE',
					`Completed learning task: "${task.title}"`
				);
			}
		}

		dbStore.saveTask(task);
		return task;
	}

	// Delete task
	public static deleteTask(taskId: string, userId: string): boolean {
		return dbStore.deleteTask(taskId, userId);
	}

	// Seed learning-aware tasks for demo
	public static seedInitialTasks(goalId: string, userId: string): Task[] {
		const tasks: Task[] = [
			{
				id: crypto.randomUUID(),
				goalId,
				userId,
				title: 'Implement Adjacency List graph in TypeScript',
				description: 'Write an Adjacency List graph class with addVertex, addEdge, and print methods.',
				conceptName: 'Graph Representation',
				estimatedMinutes: 25,
				type: 'LEARN',
				status: 'COMPLETED',
				priority: 'HIGH',
				whyReason: 'Foundational representation needed before writing traversal algorithms.',
				completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
				createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
			},
			{
				id: crypto.randomUUID(),
				goalId,
				userId,
				title: 'Solve 2 BFS unweighted shortest path problems',
				description: 'Focus on Rotting Oranges (LeetCode 994) and Shortest Path in Binary Matrix (LeetCode 1091).',
				conceptName: 'Breadth-First Search (BFS)',
				estimatedMinutes: 35,
				type: 'PRACTICE',
				status: 'IN_PROGRESS',
				priority: 'HIGH',
				whyReason: 'BFS accuracy is currently developing. Targeted practice will solidify FIFO queue invariants.',
				createdAt: new Date().toISOString()
			},
			{
				id: crypto.randomUUID(),
				goalId,
				userId,
				title: 'DFS Recursion & Cycle Detection Drills',
				description: 'Implement recursive DFS on directed graphs with 3-color states (White, Gray, Black) for cycle detection.',
				conceptName: 'Depth-First Search (DFS)',
				estimatedMinutes: 30,
				type: 'PRACTICE',
				status: 'TODO',
				priority: 'MEDIUM',
				whyReason: 'Prepares for Topological Sort and dependency graph resolution in Week 3.',
				createdAt: new Date().toISOString()
			},
			{
				id: crypto.randomUUID(),
				goalId,
				userId,
				title: 'Spaced review: Dijkstra non-negative invariant',
				description: 'Explain why Dijkstra fails with negative cycles to solidify edge relaxation principles.',
				conceptName: 'Dijkstra & Shortest Paths',
				estimatedMinutes: 15,
				type: 'REVIEW',
				status: 'BACKLOG',
				priority: 'LOW',
				whyReason: 'Scheduled review to prepare for upcoming Week 2 shortest path milestone.',
				createdAt: new Date().toISOString()
			}
		];

		dbStore.saveTasks(tasks);
		return tasks;
	}
}
