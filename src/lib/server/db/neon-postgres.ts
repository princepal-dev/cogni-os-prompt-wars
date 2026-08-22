import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { User, LearnerProfile, LearningGoal, Roadmap, Task, Note, Flashcard, Quiz, QuizAttempt } from '$lib/types/domain';

let sqlClient: NeonQueryFunction<false, false> | null = null;

export function getNeonSql(): NeonQueryFunction<false, false> | null {
	const url = process.env.DATABASE_URL;
	if (!url || (!url.startsWith('postgres://') && !url.startsWith('postgresql://'))) {
		return null;
	}
	if (!sqlClient) {
		sqlClient = neon(url);
	}
	return sqlClient;
}

export class NeonPostgresService {
	public static async saveUser(user: User, passwordHash: string): Promise<void> {
		const sql = getNeonSql();
		if (!sql) return;
		try {
			await sql`
				INSERT INTO users (id, email, password_hash, name, created_at)
				VALUES (${user.id}, ${user.email}, ${passwordHash}, ${user.name}, ${user.createdAt})
				ON CONFLICT (id) DO UPDATE SET
					email = EXCLUDED.email,
					password_hash = EXCLUDED.password_hash,
					name = EXCLUDED.name;
			`;
		} catch (e) {
			console.warn('Neon Postgres saveUser error:', e);
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
		} catch (e) {
			console.warn('Neon Postgres saveSession error:', e);
		}
	}

	public static async deleteSession(token: string): Promise<void> {
		const sql = getNeonSql();
		if (!sql) return;
		try {
			await sql`DELETE FROM sessions WHERE token = ${token};`;
		} catch (e) {
			console.warn('Neon Postgres deleteSession error:', e);
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
		} catch (e) {
			console.warn('Neon Postgres saveGoal error:', e);
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
			console.warn('Neon Postgres saveTask error:', e);
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
			console.warn('Neon Postgres saveNote error:', e);
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
			console.warn('Neon Postgres saveFlashcard error:', e);
		}
	}
}
