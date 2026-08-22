import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import fs from 'node:fs';
import path from 'node:path';
import type { User, LearnerProfile, LearningGoal, Roadmap, Task, Note, Flashcard, Quiz, QuizAttempt } from '$lib/types/domain';

let sqlClient: NeonQueryFunction<false, false> | null = null;

export function isTestMode(): boolean {
	return process.env.IS_TEST === 'true';
}

export function getDatabaseUrl(): string | null {
	if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
	try {
		const envPath = path.resolve(process.cwd(), '.env');
		if (fs.existsSync(envPath)) {
			const content = fs.readFileSync(envPath, 'utf-8');
			for (const line of content.split('\n')) {
				const trimmed = line.trim();
				if (trimmed.startsWith('DATABASE_URL=')) {
					return trimmed.slice('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
				}
			}
		}
	} catch (e) {
		console.warn('[Neon Postgres] Error reading .env for DATABASE_URL:', e);
	}
	return null;
}

export function getNeonSql(): NeonQueryFunction<false, false> | null {
	if (isTestMode()) return null;
	const url = getDatabaseUrl();
	if (!url || (!url.startsWith('postgres://') && !url.startsWith('postgresql://'))) {
		return null;
	}
	if (!sqlClient) {
		sqlClient = neon(url);
	}
	return sqlClient;
}

export class NeonPostgresService {
	public static async getUserByEmail(email: string): Promise<User | null> {
		const sql = getNeonSql();
		if (!sql) return null;
		try {
			const rows = await sql`
				SELECT id, email, name, created_at FROM users
				WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1;
			`;
			if (!rows || rows.length === 0) return null;
			const r = rows[0];
			return {
				id: r.id,
				email: r.email,
				name: r.name,
				createdAt: new Date(r.created_at).toISOString()
			};
		} catch (e) {
			console.warn('[Neon Postgres] getUserByEmail error:', e);
			return null;
		}
	}

	public static async getUserById(id: string): Promise<User | null> {
		const sql = getNeonSql();
		if (!sql) return null;
		try {
			const rows = await sql`
				SELECT id, email, name, created_at FROM users
				WHERE id = ${id} LIMIT 1;
			`;
			if (!rows || rows.length === 0) return null;
			const r = rows[0];
			return {
				id: r.id,
				email: r.email,
				name: r.name,
				createdAt: new Date(r.created_at).toISOString()
			};
		} catch (e) {
			console.warn('[Neon Postgres] getUserById error:', e);
			return null;
		}
	}

	public static async getPasswordHash(userId: string): Promise<string | null> {
		const sql = getNeonSql();
		if (!sql) return null;
		try {
			const rows = await sql`
				SELECT password_hash FROM users
				WHERE id = ${userId} LIMIT 1;
			`;
			if (!rows || rows.length === 0) return null;
			return rows[0].password_hash as string;
		} catch (e) {
			console.warn('[Neon Postgres] getPasswordHash error:', e);
			return null;
		}
	}

	public static async saveUser(user: User, passwordHash: string): Promise<void> {
		const sql = getNeonSql();
		if (!sql) {
			console.warn('[Neon Postgres] SQL client unavailable. Skipping cloud user save.');
			return;
		}
		try {
			await sql`
				INSERT INTO users (id, email, password_hash, name, created_at)
				VALUES (${user.id}, ${user.email}, ${passwordHash}, ${user.name}, ${user.createdAt})
				ON CONFLICT (id) DO UPDATE SET
					email = EXCLUDED.email,
					password_hash = EXCLUDED.password_hash,
					name = EXCLUDED.name;
			`;
			console.log(`[Neon Postgres] Successfully saved user to database: ${user.name} <${user.email}> (${user.id})`);
		} catch (e) {
			console.error('[Neon Postgres] saveUser error:', e);
		}
	}

	public static async saveSession(session: { id: string; userId: string; token: string; expiresAt: string; createdAt: string }): Promise<void> {
		const sql = getNeonSql();
		if (!sql) return;
		try {
			await sql`
				INSERT INTO sessions (id, user_id, token, expires_at, created_at)
				VALUES (${session.id}, ${session.userId}, ${session.token}, ${session.expiresAt}, ${session.createdAt})
				ON CONFLICT (id) DO UPDATE SET
					token = EXCLUDED.token,
					expires_at = EXCLUDED.expires_at;
			`;
			console.log(`[Neon Postgres] Saved active session for user: ${session.userId}`);
		} catch (e) {
			console.error('[Neon Postgres] saveSession error:', e);
		}
	}

	public static async getSessionByToken(token: string): Promise<{ id: string; userId: string; token: string; expiresAt: string } | null> {
		const sql = getNeonSql();
		if (!sql) return null;
		try {
			const rows = await sql`
				SELECT id, user_id, token, expires_at FROM sessions
				WHERE token = ${token} AND expires_at > NOW() LIMIT 1;
			`;
			if (!rows || rows.length === 0) return null;
			const r = rows[0];
			return {
				id: r.id,
				userId: r.user_id,
				token: r.token,
				expiresAt: new Date(r.expires_at).toISOString()
			};
		} catch (e) {
			console.warn('[Neon Postgres] getSessionByToken error:', e);
			return null;
		}
	}

	public static async deleteSession(token: string): Promise<void> {
		const sql = getNeonSql();
		if (!sql) return;
		try {
			await sql`DELETE FROM sessions WHERE token = ${token};`;
		} catch (e) {
			console.warn('[Neon Postgres] deleteSession error:', e);
		}
	}

	public static async saveGoal(goal: LearningGoal): Promise<void> {
		const sql = getNeonSql();
		if (!sql) return;
		try {
			await sql`
				INSERT INTO learning_goals (
					id, user_id, title, motivation, target_outcome, deadline,
					daily_minutes_budget, study_days_per_week, preferences,
					initial_knowledge_level, status, feasibility_data, created_at, updated_at
				) VALUES (
					${goal.id}, ${goal.userId}, ${goal.title}, ${goal.motivation},
					${goal.targetOutcome}, ${goal.deadline}, ${goal.dailyMinutesBudget},
					${goal.studyDaysPerWeek}, ${JSON.stringify(goal.preferences)},
					${goal.initialKnowledgeLevel}, ${goal.status},
					${JSON.stringify(goal.feasibility || {})}, ${goal.createdAt}, ${goal.updatedAt}
				) ON CONFLICT (id) DO UPDATE SET
					title = EXCLUDED.title,
					target_outcome = EXCLUDED.target_outcome,
					feasibility_data = EXCLUDED.feasibility_data,
					updated_at = EXCLUDED.updated_at;
			`;
			console.log(`[Neon Postgres] Saved learning goal: ${goal.title} (${goal.id})`);
		} catch (e) {
			console.error('[Neon Postgres] saveGoal error:', e);
		}
	}

	public static async saveTask(task: Task): Promise<void> {
		const sql = getNeonSql();
		if (!sql) return;
		try {
			await sql`
				INSERT INTO tasks (
					id, goal_id, user_id, title, description, concept_id, concept_name,
					estimated_minutes, type, status, priority, why_reason, is_ai_recommended,
					completed_at, created_at
				) VALUES (
					${task.id}, ${task.goalId}, ${task.userId}, ${task.title},
					${task.description}, ${task.conceptId || null}, ${task.conceptName || null},
					${task.estimatedMinutes}, ${task.type}, ${task.status}, ${task.priority},
					${task.whyReason}, ${task.isAiRecommended}, ${task.completedAt || null},
					${task.createdAt}
				) ON CONFLICT (id) DO UPDATE SET
					status = EXCLUDED.status,
					completed_at = EXCLUDED.completed_at;
			`;
		} catch (e) {
			console.error('[Neon Postgres] saveTask error:', e);
		}
	}

	public static async saveNote(note: Note): Promise<void> {
		const sql = getNeonSql();
		if (!sql) return;
		try {
			await sql`
				INSERT INTO notes (
					id, goal_id, user_id, title, markdown_content, extracted_concepts,
					suggested_connections, created_at, updated_at
				) VALUES (
					${note.id}, ${note.goalId}, ${note.userId}, ${note.title},
					${note.markdownContent}, ${JSON.stringify(note.extractedConcepts || [])},
					${JSON.stringify(note.suggestedConnections || [])}, ${note.createdAt},
					${note.updatedAt}
				) ON CONFLICT (id) DO UPDATE SET
					title = EXCLUDED.title,
					markdown_content = EXCLUDED.markdown_content,
					extracted_concepts = EXCLUDED.extracted_concepts,
					suggested_connections = EXCLUDED.suggested_connections,
					updated_at = EXCLUDED.updated_at;
			`;
		} catch (e) {
			console.error('[Neon Postgres] saveNote error:', e);
		}
	}

	public static async saveFlashcard(card: Flashcard): Promise<void> {
		const sql = getNeonSql();
		if (!sql) return;
		try {
			await sql`
				INSERT INTO flashcards (
					id, goal_id, user_id, concept_id, concept_name, source,
					front, back, interval_days, ease_factor, repetitions,
					next_review_date, last_reviewed_at, created_at
				) VALUES (
					${card.id}, ${card.goalId}, ${card.userId}, ${card.conceptId || null},
					${card.conceptName}, ${card.source}, ${card.front}, ${card.back},
					${card.intervalDays}, ${card.easeFactor}, ${card.repetitions},
					${card.nextReviewDate}, ${card.lastReviewedAt || null}, ${card.createdAt}
				) ON CONFLICT (id) DO UPDATE SET
					interval_days = EXCLUDED.interval_days,
					ease_factor = EXCLUDED.ease_factor,
					repetitions = EXCLUDED.repetitions,
					next_review_date = EXCLUDED.next_review_date,
					last_reviewed_at = EXCLUDED.last_reviewed_at;
			`;
		} catch (e) {
			console.error('[Neon Postgres] saveFlashcard error:', e);
		}
	}

	public static async getGoals(userId: string): Promise<LearningGoal[]> {
		const sql = getNeonSql();
		if (!sql) return [];
		try {
			const rows = await sql`
				SELECT id, user_id, title, motivation, target_outcome, deadline,
				       daily_minutes_budget, study_days_per_week, preferences,
				       initial_knowledge_level, status, feasibility_data, created_at, updated_at
				FROM learning_goals
				WHERE user_id = ${userId}
				ORDER BY created_at DESC;
			`;
			return rows.map((r: any) => ({
				id: r.id,
				userId: r.user_id,
				title: r.title,
				motivation: r.motivation,
				targetOutcome: r.target_outcome,
				deadline: r.deadline,
				dailyMinutesBudget: r.daily_minutes_budget,
				studyDaysPerWeek: r.study_days_per_week,
				preferences: typeof r.preferences === 'string' ? JSON.parse(r.preferences) : r.preferences || [],
				initialKnowledgeLevel: r.initial_knowledge_level,
				status: r.status,
				feasibility: typeof r.feasibility_data === 'string' ? JSON.parse(r.feasibility_data) : r.feasibility_data || {},
				totalConceptsCount: 0,
				masteredConceptsCount: 0,
				createdAt: new Date(r.created_at).toISOString(),
				updatedAt: new Date(r.updated_at).toISOString()
			}));
		} catch (e) {
			console.warn('[Neon Postgres] getGoals error:', e);
			return [];
		}
	}

	public static async getGoalById(goalId: string, userId: string): Promise<LearningGoal | null> {
		const sql = getNeonSql();
		if (!sql) return null;
		try {
			const rows = await sql`
				SELECT id, user_id, title, motivation, target_outcome, deadline,
				       daily_minutes_budget, study_days_per_week, preferences,
				       initial_knowledge_level, status, feasibility_data, created_at, updated_at
				FROM learning_goals
				WHERE id = ${goalId} AND user_id = ${userId}
				LIMIT 1;
			`;
			if (!rows || rows.length === 0) return null;
			const r = rows[0];
			return {
				id: r.id,
				userId: r.user_id,
				title: r.title,
				motivation: r.motivation,
				targetOutcome: r.target_outcome,
				deadline: r.deadline,
				dailyMinutesBudget: r.daily_minutes_budget,
				studyDaysPerWeek: r.study_days_per_week,
				preferences: typeof r.preferences === 'string' ? JSON.parse(r.preferences) : r.preferences || [],
				initialKnowledgeLevel: r.initial_knowledge_level,
				status: r.status,
				feasibility: typeof r.feasibility_data === 'string' ? JSON.parse(r.feasibility_data) : r.feasibility_data || {},
				totalConceptsCount: 0,
				masteredConceptsCount: 0,
				createdAt: new Date(r.created_at).toISOString(),
				updatedAt: new Date(r.updated_at).toISOString()
			};
		} catch (e) {
			console.warn('[Neon Postgres] getGoalById error:', e);
			return null;
		}
	}

	public static async getTasks(goalId: string, userId: string): Promise<Task[]> {
		const sql = getNeonSql();
		if (!sql) return [];
		try {
			const rows = await sql`
				SELECT id, goal_id, user_id, title, description, concept_id, concept_name,
				       estimated_minutes, type, status, priority, why_reason, is_ai_recommended,
				       completed_at, created_at
				FROM tasks
				WHERE goal_id = ${goalId} AND user_id = ${userId}
				ORDER BY created_at ASC;
			`;
			return rows.map((r: any) => ({
				id: r.id,
				goalId: r.goal_id,
				userId: r.user_id,
				title: r.title,
				description: r.description,
				conceptId: r.concept_id,
				conceptName: r.concept_name,
				estimatedMinutes: r.estimated_minutes,
				type: r.type,
				status: r.status,
				priority: r.priority,
				whyReason: r.why_reason,
				isAiRecommended: r.is_ai_recommended,
				completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
				createdAt: new Date(r.created_at).toISOString()
			}));
		} catch (e) {
			console.warn('[Neon Postgres] getTasks error:', e);
			return [];
		}
	}

	public static async getNotes(goalId: string, userId: string): Promise<Note[]> {
		const sql = getNeonSql();
		if (!sql) return [];
		try {
			const rows = await sql`
				SELECT id, goal_id, user_id, title, markdown_content, extracted_concepts,
				       suggested_connections, created_at, updated_at
				FROM notes
				WHERE goal_id = ${goalId} AND user_id = ${userId}
				ORDER BY updated_at DESC;
			`;
			return rows.map((r: any) => ({
				id: r.id,
				goalId: r.goal_id,
				userId: r.user_id,
				title: r.title,
				markdownContent: r.markdown_content,
				extractedConcepts: typeof r.extracted_concepts === 'string' ? JSON.parse(r.extracted_concepts) : r.extracted_concepts || [],
				suggestedConnections: typeof r.suggested_connections === 'string' ? JSON.parse(r.suggested_connections) : r.suggested_connections || [],
				backlinks: [],
				createdAt: new Date(r.created_at).toISOString(),
				updatedAt: new Date(r.updated_at).toISOString()
			}));
		} catch (e) {
			console.warn('[Neon Postgres] getNotes error:', e);
			return [];
		}
	}

	public static async getFlashcards(goalId: string, userId: string): Promise<Flashcard[]> {
		const sql = getNeonSql();
		if (!sql) return [];
		try {
			const rows = await sql`
				SELECT id, goal_id, user_id, concept_id, concept_name, source,
				       front, back, interval_days, ease_factor, repetitions,
				       next_review_date, last_reviewed_at, created_at
				FROM flashcards
				WHERE goal_id = ${goalId} AND user_id = ${userId}
				ORDER BY created_at ASC;
			`;
			return rows.map((r: any) => ({
				id: r.id,
				goalId: r.goal_id,
				userId: r.user_id,
				conceptId: r.concept_id,
				conceptName: r.concept_name,
				source: r.source,
				front: r.front,
				back: r.back,
				intervalDays: r.interval_days,
				easeFactor: Number(r.ease_factor),
				repetitions: r.repetitions,
				nextReviewDate: r.next_review_date,
				lastReviewedAt: r.last_reviewed_at ? new Date(r.last_reviewed_at).toISOString() : undefined,
				createdAt: new Date(r.created_at).toISOString()
			}));
		} catch (e) {
			console.warn('[Neon Postgres] getFlashcards error:', e);
			return [];
		}
	}
}
