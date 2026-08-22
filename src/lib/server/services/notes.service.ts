// Second Brain & Obsidian-Inspired Notes Service

import crypto from 'node:crypto';
import { dbStore } from '../db/store';
import { AIService } from '../ai/ai.service';
import type { Note, Flashcard } from '$lib/types/domain';

export class NotesService {
	// Save or create a note with automatic concept analysis
	public static async saveNote(
		userId: string,
		goalId: string,
		title: string,
		markdownContent: string,
		noteId?: string
	): Promise<Note> {
		const existing = noteId ? dbStore.getNoteById(noteId, userId) : undefined;
		const id = existing ? existing.id : crypto.randomUUID();

		let extractedConcepts: string[] = [];
		let suggestedConnections: { conceptName: string; reason: string; connected: boolean }[] = [];

		if (AIService.isAvailable() && process.env.NODE_ENV !== 'test') {
			try {
				const analysis = await AIService.analyzeNote(markdownContent);
				extractedConcepts = analysis.extractedConcepts || [];
				suggestedConnections = analysis.suggestedConnections || [];
			} catch (e) {
				console.warn('AI analysis skipped for note:', e);
			}
		}

		if (extractedConcepts.length === 0) {
			// Extract hashtags and key technical tokens directly from note
			const tagMatches = markdownContent.match(/#[a-zA-Z0-9_-]+/g) || [];
			extractedConcepts = tagMatches.map((t) => t.slice(1));
			if (extractedConcepts.length === 0) {
				const lower = markdownContent.toLowerCase();
				if (lower.includes('bfs')) extractedConcepts.push('Breadth-First Search (BFS)');
				if (lower.includes('dfs')) extractedConcepts.push('Depth-First Search (DFS)');
				if (lower.includes('dijkstra')) extractedConcepts.push('Dijkstra & Shortest Paths');
				if (lower.includes('queue')) extractedConcepts.push('Queue Data Structure');
			}
		}

		const note: Note = {
			id,
			goalId,
			userId,
			title: title.trim() || 'Untitled Study Note',
			markdownContent,
			extractedConcepts,
			suggestedConnections,
			backlinks: existing?.backlinks || [],
			createdAt: existing?.createdAt || new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		dbStore.saveNote(note);

		// Increment note count on matched concepts
		for (const conceptName of extractedConcepts) {
			const state = dbStore.getKnowledgeStateByConcept(conceptName, goalId, userId);
			if (state) {
				state.notesCount += 1;
				dbStore.saveKnowledgeState(state);
			}
		}

		return note;
	}

	// Generate Flashcards from a Note
	public static async generateFlashcardsFromNote(noteId: string, userId: string): Promise<Flashcard[]> {
		const note = dbStore.getNoteById(noteId, userId);
		if (!note) throw new Error('Note not found');

		if (!AIService.isAvailable()) {
			throw new Error('Ada (AI Learning Agent) is currently offline. Please configure your OpenRouter API key in Settings to generate flashcards with AI.');
		}

		const analysis = await AIService.analyzeNote(note.markdownContent);
		const flashcards: Flashcard[] = [];
		const today = new Date().toISOString().split('T')[0];

		for (const card of analysis.generatedFlashcards || []) {
			const flashcard: Flashcard = {
				id: crypto.randomUUID(),
				goalId: note.goalId,
				userId,
				conceptName: note.extractedConcepts[0] || 'Graph Algorithms',
				source: 'NOTE',
				front: card.front,
				back: card.back,
				intervalDays: 1,
				easeFactor: 250,
				repetitions: 0,
				nextReviewDate: today,
				createdAt: new Date().toISOString()
			};
			dbStore.saveFlashcard(flashcard);
			flashcards.push(flashcard);
		}

		return flashcards;
	}

	// Get all notes for a goal
	public static getNotes(goalId: string, userId: string): Note[] {
		return dbStore.getNotes(goalId, userId);
	}

	// Delete note
	public static deleteNote(noteId: string, userId: string): boolean {
		return dbStore.deleteNote(noteId, userId);
	}
}
