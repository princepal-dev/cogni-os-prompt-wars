import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const sessionsTable = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
	token: text('token').notNull().unique(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const learnerProfilesTable = pgTable('learner_profiles', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull().unique(),
	background: text('background').notNull(),
	dailyStudyMinutes: integer('daily_study_minutes').default(45).notNull(),
	studyDaysPerWeek: integer('study_days_per_week').default(5).notNull(),
	preferredModalities: jsonb('preferred_modalities').$type<string[]>().notNull(),
	inferredSessionPace: text('inferred_session_pace').default('BALANCED').notNull(),
	preferredSessionDurationMin: integer('preferred_session_duration_min').default(30).notNull(),
	bestStudyTime: text('best_study_time').default('EVENING').notNull(),
	streakDays: integer('streak_days').default(1).notNull(),
	lastActiveDate: text('last_active_date').notNull()
});

export const learningGoalsTable = pgTable('learning_goals', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
	title: text('title').notNull(),
	motivation: text('motivation').notNull(),
	targetOutcome: text('target_outcome').notNull(),
	deadline: text('deadline').notNull(),
	dailyMinutesBudget: integer('daily_minutes_budget').notNull(),
	studyDaysPerWeek: integer('study_days_per_week').notNull(),
	preferences: jsonb('preferences').$type<string[]>().notNull(),
	initialKnowledgeLevel: text('initial_knowledge_level').notNull(),
	status: text('status').default('ACTIVE').notNull(),
	feasibilityData: jsonb('feasibility_data').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const knowledgeConceptsTable = pgTable('knowledge_concepts', {
	id: text('id').primaryKey(),
	goalId: text('goal_id').references(() => learningGoalsTable.id, { onDelete: 'cascade' }).notNull(),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	category: text('category').notNull(),
	description: text('description').notNull(),
	importance: text('importance').default('CORE').notNull(),
	estimatedHoursToLearn: integer('estimated_hours_to_learn').default(2).notNull(),
	prerequisites: jsonb('prerequisites').$type<string[]>().notNull(),
	subconcepts: jsonb('subconcepts').$type<string[]>().notNull()
});

export const knowledgeStatesTable = pgTable('knowledge_states', {
	id: text('id').primaryKey(),
	conceptId: text('concept_id').references(() => knowledgeConceptsTable.id, { onDelete: 'cascade' }).notNull(),
	conceptName: text('concept_name').notNull(),
	goalId: text('goal_id').references(() => learningGoalsTable.id, { onDelete: 'cascade' }).notNull(),
	userId: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
	state: text('state').default('UNKNOWN').notNull(),
	masteryScore: integer('mastery_score').default(0).notNull(),
	recallStrength: integer('recall_strength').default(100).notNull(),
	lastAssessedAt: timestamp('last_assessed_at').defaultNow().notNull(),
	reviewDueAt: timestamp('review_due_at').defaultNow().notNull(),
	timesReviewed: integer('times_reviewed').default(0).notNull(),
	timesPracticed: integer('times_practiced').default(0).notNull(),
	errorFrequency: integer('error_frequency').default(0).notNull(),
	recentMisconceptions: jsonb('recent_misconceptions').$type<string[]>().default([]).notNull()
});

export const roadmapsTable = pgTable('roadmaps', {
	id: text('id').primaryKey(),
	goalId: text('goal_id').references(() => learningGoalsTable.id, { onDelete: 'cascade' }).notNull().unique(),
	title: text('title').notNull(),
	version: integer('version').default(1).notNull(),
	summary: text('summary').notNull(),
	totalEstimatedHours: integer('total_estimated_hours').notNull(),
	milestonesData: jsonb('milestones_data').notNull(),
	adaptationCount: integer('adaptation_count').default(0).notNull(),
	lastAdaptedAt: timestamp('last_adapted_at'),
	activeAdaptationNotice: text('active_adaptation_notice'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const tasksTable = pgTable('tasks', {
	id: text('id').primaryKey(),
	goalId: text('goal_id').references(() => learningGoalsTable.id, { onDelete: 'cascade' }).notNull(),
	userId: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	conceptId: text('concept_id'),
	conceptName: text('concept_name'),
	estimatedMinutes: integer('estimated_minutes').default(20).notNull(),
	type: text('type').default('LEARN').notNull(),
	status: text('status').default('BACKLOG').notNull(),
	priority: text('priority').default('MEDIUM').notNull(),
	whyReason: text('why_reason').notNull(),
	isAiRecommended: boolean('is_ai_recommended').default(false).notNull(),
	completedAt: timestamp('completed_at'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const notesTable = pgTable('notes', {
	id: text('id').primaryKey(),
	goalId: text('goal_id').references(() => learningGoalsTable.id, { onDelete: 'cascade' }).notNull(),
	userId: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
	title: text('title').notNull(),
	markdownContent: text('markdown_content').notNull(),
	extractedConcepts: jsonb('extracted_concepts').$type<string[]>().default([]).notNull(),
	suggestedConnections: jsonb('suggested_connections').$type<any[]>().default([]).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const inboxItemsTable = pgTable('inbox_items', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
	goalId: text('goal_id'),
	type: text('type').notNull(),
	title: text('title').notNull(),
	content: text('content').notNull(),
	url: text('url'),
	triageStatus: text('triage_status').default('INBOX').notNull(),
	aiSuggestedGoalTitle: text('ai_suggested_goal_title'),
	aiSummary: text('ai_summary'),
	tags: jsonb('tags').$type<string[]>().default([]).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const flashcardsTable = pgTable('flashcards', {
	id: text('id').primaryKey(),
	goalId: text('goal_id').references(() => learningGoalsTable.id, { onDelete: 'cascade' }).notNull(),
	userId: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
	conceptId: text('concept_id'),
	conceptName: text('concept_name').notNull(),
	source: text('source').default('CONCEPT').notNull(),
	front: text('front').notNull(),
	back: text('back').notNull(),
	intervalDays: integer('interval_days').default(1).notNull(),
	easeFactor: integer('ease_factor').default(250).notNull(), // 2.5 represented as 250
	repetitions: integer('repetitions').default(0).notNull(),
	nextReviewDate: text('next_review_date').notNull(),
	lastReviewedAt: timestamp('last_reviewed_at'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const quizzesTable = pgTable('quizzes', {
	id: text('id').primaryKey(),
	goalId: text('goal_id').references(() => learningGoalsTable.id, { onDelete: 'cascade' }).notNull(),
	title: text('title').notNull(),
	mode: text('mode').default('CONCEPT').notNull(),
	targetConceptNames: jsonb('target_concept_names').$type<string[]>().notNull(),
	questionsData: jsonb('questions_data').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const quizAttemptsTable = pgTable('quiz_attempts', {
	id: text('id').primaryKey(),
	quizId: text('quiz_id').references(() => quizzesTable.id, { onDelete: 'cascade' }).notNull(),
	goalId: text('goal_id').references(() => learningGoalsTable.id, { onDelete: 'cascade' }).notNull(),
	userId: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
	score: integer('score').notNull(),
	maxScore: integer('max_score').notNull(),
	percentage: integer('percentage').notNull(),
	userAnswers: jsonb('user_answers').notNull(),
	conceptBreakdown: jsonb('concept_breakdown').notNull(),
	misconceptions: jsonb('misconceptions').$type<string[]>().default([]).notNull(),
	feedback: text('feedback').notNull(),
	timestamp: timestamp('timestamp').defaultNow().notNull()
});
