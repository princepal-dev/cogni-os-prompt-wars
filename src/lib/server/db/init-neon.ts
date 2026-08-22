import { neon } from '@neondatabase/serverless';

export async function initializeNeonDatabase(connectionString?: string) {
	const url = connectionString || process.env.DATABASE_URL;
	if (!url) {
		console.warn('No DATABASE_URL provided. Skipping Neon initialization.');
		return { success: false, reason: 'No DATABASE_URL' };
	}

	const sql = neon(url);

	console.log('Connecting to Neon PostgreSQL and creating tables...');

	try {
		await sql`
			CREATE TABLE IF NOT EXISTS users (
				id TEXT PRIMARY KEY,
				email TEXT NOT NULL UNIQUE,
				password_hash TEXT NOT NULL,
				name TEXT NOT NULL,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS sessions (
				id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				token TEXT NOT NULL UNIQUE,
				expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS password_resets (
				token TEXT PRIMARY KEY,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS learner_profiles (
				id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
				background TEXT NOT NULL,
				daily_study_minutes INTEGER DEFAULT 45 NOT NULL,
				study_days_per_week INTEGER DEFAULT 5 NOT NULL,
				preferred_modalities JSONB NOT NULL,
				inferred_session_pace TEXT DEFAULT 'BALANCED' NOT NULL,
				preferred_session_duration_min INTEGER DEFAULT 30 NOT NULL,
				best_study_time TEXT DEFAULT 'EVENING' NOT NULL,
				streak_days INTEGER DEFAULT 1 NOT NULL,
				last_active_date TEXT NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS learning_goals (
				id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				title TEXT NOT NULL,
				motivation TEXT NOT NULL,
				target_outcome TEXT NOT NULL,
				deadline TEXT NOT NULL,
				daily_minutes_budget INTEGER NOT NULL,
				study_days_per_week INTEGER NOT NULL,
				preferences JSONB NOT NULL,
				initial_knowledge_level TEXT NOT NULL,
				status TEXT DEFAULT 'ACTIVE' NOT NULL,
				feasibility_data JSONB NOT NULL,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS knowledge_concepts (
				id TEXT PRIMARY KEY,
				goal_id TEXT NOT NULL REFERENCES learning_goals(id) ON DELETE CASCADE,
				name TEXT NOT NULL,
				slug TEXT NOT NULL,
				category TEXT NOT NULL,
				description TEXT NOT NULL,
				importance TEXT DEFAULT 'CORE' NOT NULL,
				estimated_hours_to_learn INTEGER DEFAULT 2 NOT NULL,
				prerequisites JSONB NOT NULL,
				subconcepts JSONB NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS knowledge_states (
				id TEXT PRIMARY KEY,
				concept_id TEXT NOT NULL REFERENCES knowledge_concepts(id) ON DELETE CASCADE,
				concept_name TEXT NOT NULL,
				goal_id TEXT NOT NULL REFERENCES learning_goals(id) ON DELETE CASCADE,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				state TEXT DEFAULT 'UNKNOWN' NOT NULL,
				mastery_score INTEGER DEFAULT 0 NOT NULL,
				recall_strength INTEGER DEFAULT 100 NOT NULL,
				last_assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
				review_due_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
				times_reviewed INTEGER DEFAULT 0 NOT NULL,
				times_practiced INTEGER DEFAULT 0 NOT NULL,
				error_frequency INTEGER DEFAULT 0 NOT NULL,
				recent_misconceptions JSONB DEFAULT '[]'::jsonb NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS roadmaps (
				id TEXT PRIMARY KEY,
				goal_id TEXT NOT NULL UNIQUE REFERENCES learning_goals(id) ON DELETE CASCADE,
				title TEXT NOT NULL,
				version INTEGER DEFAULT 1 NOT NULL,
				summary TEXT NOT NULL,
				total_estimated_hours INTEGER NOT NULL,
				milestones_data JSONB NOT NULL,
				adaptation_count INTEGER DEFAULT 0 NOT NULL,
				last_adapted_at TIMESTAMP WITH TIME ZONE,
				active_adaptation_notice TEXT,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS tasks (
				id TEXT PRIMARY KEY,
				goal_id TEXT NOT NULL REFERENCES learning_goals(id) ON DELETE CASCADE,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				title TEXT NOT NULL,
				description TEXT NOT NULL,
				concept_id TEXT,
				concept_name TEXT,
				estimated_minutes INTEGER DEFAULT 20 NOT NULL,
				type TEXT DEFAULT 'LEARN' NOT NULL,
				status TEXT DEFAULT 'BACKLOG' NOT NULL,
				priority TEXT DEFAULT 'MEDIUM' NOT NULL,
				why_reason TEXT NOT NULL,
				is_ai_recommended BOOLEAN DEFAULT FALSE NOT NULL,
				completed_at TIMESTAMP WITH TIME ZONE,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS notes (
				id TEXT PRIMARY KEY,
				goal_id TEXT NOT NULL REFERENCES learning_goals(id) ON DELETE CASCADE,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				title TEXT NOT NULL,
				markdown_content TEXT NOT NULL,
				extracted_concepts JSONB DEFAULT '[]'::jsonb NOT NULL,
				suggested_connections JSONB DEFAULT '[]'::jsonb NOT NULL,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS inbox_items (
				id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				goal_id TEXT,
				type TEXT NOT NULL,
				title TEXT NOT NULL,
				content TEXT NOT NULL,
				url TEXT,
				triage_status TEXT DEFAULT 'INBOX' NOT NULL,
				ai_suggested_goal_title TEXT,
				ai_summary TEXT,
				tags JSONB DEFAULT '[]'::jsonb NOT NULL,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS flashcards (
				id TEXT PRIMARY KEY,
				goal_id TEXT NOT NULL REFERENCES learning_goals(id) ON DELETE CASCADE,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				concept_id TEXT,
				concept_name TEXT NOT NULL,
				source TEXT DEFAULT 'CONCEPT' NOT NULL,
				front TEXT NOT NULL,
				back TEXT NOT NULL,
				interval_days INTEGER DEFAULT 1 NOT NULL,
				ease_factor INTEGER DEFAULT 250 NOT NULL,
				repetitions INTEGER DEFAULT 0 NOT NULL,
				next_review_date TEXT NOT NULL,
				last_reviewed_at TIMESTAMP WITH TIME ZONE,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS quizzes (
				id TEXT PRIMARY KEY,
				goal_id TEXT NOT NULL REFERENCES learning_goals(id) ON DELETE CASCADE,
				title TEXT NOT NULL,
				mode TEXT DEFAULT 'CONCEPT' NOT NULL,
				target_concept_names JSONB NOT NULL,
				questions_data JSONB NOT NULL,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS quiz_attempts (
				id TEXT PRIMARY KEY,
				quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
				goal_id TEXT NOT NULL REFERENCES learning_goals(id) ON DELETE CASCADE,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				score INTEGER NOT NULL,
				max_score INTEGER NOT NULL,
				percentage INTEGER NOT NULL,
				user_answers JSONB NOT NULL,
				concept_breakdown JSONB NOT NULL,
				misconceptions JSONB DEFAULT '[]'::jsonb NOT NULL,
				feedback TEXT NOT NULL,
				timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
			);
		`;

		console.log('All Neon PostgreSQL tables verified/created successfully!');
		return { success: true };
	} catch (error) {
		console.error('Error creating Neon database tables:', error);
		return { success: false, error };
	}
}
