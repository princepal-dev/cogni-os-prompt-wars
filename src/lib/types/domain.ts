// Core Domain Types for CognitiveOS - Personal Adaptive Learning OS

export type ConceptStateType =
	| 'UNKNOWN'
	| 'INTRODUCED'
	| 'LEARNING'
	| 'DEVELOPING'
	| 'PRACTICING'
	| 'STRONG'
	| 'MASTERED'
	| 'NEEDS_REVIEW';

export type FeasibilityRatingType = 'REALISTIC' | 'TIGHT' | 'AGGRESSIVE' | 'OVERAMBITIOUS';

export type GoalMotivationType =
	| 'INTERVIEW'
	| 'EXAM'
	| 'COMPETITIVE_PROGRAMMING'
	| 'PROJECT'
	| 'CAREER'
	| 'PERSONAL_INTEREST'
	| 'OTHER';

export type GoalStatusType = 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export type ModalityPreference =
	| 'VIDEOS'
	| 'READING'
	| 'CODING'
	| 'DIAGRAMS'
	| 'QUIZZES'
	| 'FLASHCARDS'
	| 'PROJECTS'
	| 'PRACTICE_PROBLEMS';

export interface User {
	id: string;
	email: string;
	name: string;
	avatarUrl?: string;
	createdAt: string;
}

export interface LearnerProfile {
	id: string;
	userId: string;
	background: string;
	dailyStudyMinutes: number;
	studyDaysPerWeek: number;
	preferredModalities: ModalityPreference[];
	inferredSessionPace: 'FAST' | 'BALANCED' | 'DELIBERATE';
	preferredSessionDurationMin: number;
	bestStudyTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
	streakDays: number;
	lastActiveDate: string;
}

export interface FeasibilityAlternative {
	id: 'A' | 'B' | 'C' | 'D';
	title: string;
	description: string;
	actionType: 'INCREASE_TIME' | 'REDUCE_SCOPE' | 'EXTEND_DEADLINE' | 'PRIORITIZE_CORE';
	impactSummary: string;
}

export interface FeasibilityAnalysis {
	estimatedRequiredHours: number;
	availableLearningHours: number;
	requiredPracticeHours: number;
	requiredReviewHours: number;
	totalEstimatedHours: number;
	gapHours: number;
	rating: FeasibilityRatingType;
	feasibilityScore: number; // 0 - 100
	summary: string;
	recommendations: string[];
	alternatives: FeasibilityAlternative[];
}

export interface LearningGoal {
	id: string;
	userId: string;
	title: string;
	motivation: GoalMotivationType;
	targetOutcome: string;
	deadline: string; // ISO date string
	dailyMinutesBudget: number;
	studyDaysPerWeek: number;
	preferences: ModalityPreference[];
	initialKnowledgeLevel: 'BEGINNER' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'ASSESS_ME';
	status: GoalStatusType;
	feasibility: FeasibilityAnalysis;
	totalConceptsCount: number;
	masteredConceptsCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface KnowledgeConcept {
	id: string;
	goalId: string;
	name: string;
	slug: string;
	category: string;
	description: string;
	importance: 'CRITICAL' | 'CORE' | 'SECONDARY' | 'ADVANCED';
	estimatedHoursToLearn: number;
	prerequisites: string[]; // concept IDs or names
	subconcepts: string[];
}

export interface KnowledgeState {
	id: string;
	conceptId: string;
	conceptName: string;
	goalId: string;
	userId: string;
	state: ConceptStateType;
	masteryScore: number; // 0 - 100
	recallStrength: number; // 0.0 - 1.0 (decayed based on time)
	lastAssessedAt: string;
	reviewDueAt: string;
	timesReviewed: number;
	timesPracticed: number;
	errorFrequency: number;
	recentMisconceptions: string[];
	notesCount: number;
}

export interface KnowledgeRelation {
	id: string;
	goalId: string;
	sourceConceptId: string;
	targetConceptId: string;
	relationType: 'PREREQUISITE_FOR' | 'PART_OF' | 'RELATED_TO' | 'BUILDS_UPON';
}

export interface KnowledgeTimelineEvent {
	id: string;
	conceptId: string;
	conceptName: string;
	goalId: string;
	userId: string;
	previousState: ConceptStateType;
	newState: ConceptStateType;
	previousMastery: number;
	newMastery: number;
	triggerType: 'DIAGNOSTIC' | 'QUIZ' | 'TEACH_BACK' | 'PRACTICE' | 'NOTE' | 'SPACED_DECAY' | 'MANUAL';
	reason: string;
	timestamp: string;
}

export interface RoadmapModule {
	id: string;
	milestoneId: string;
	title: string;
	description: string;
	estimatedMinutes: number;
	conceptIds: string[];
	conceptNames: string[];
	dependencies: string[];
	formatType: 'VIDEO' | 'READING' | 'CODING' | 'PRACTICE' | 'QUIZ' | 'REVIEW';
	isPrerequisiteInjection?: boolean;
	whyReason: string;
	status: 'LOCKED' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Milestone {
	id: string;
	roadmapId: string;
	weekNumber: number;
	title: string;
	description: string;
	targetConcepts: string[];
	status: 'LOCKED' | 'ACTIVE' | 'COMPLETED';
	orderIndex: number;
	modules: RoadmapModule[];
}

export interface Roadmap {
	id: string;
	goalId: string;
	title: string;
	version: number;
	summary: string;
	totalEstimatedHours: number;
	milestones: Milestone[];
	lastAdaptedAt?: string;
	adaptationCount: number;
	activeAdaptationNotice?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Task {
	id: string;
	goalId: string;
	userId: string;
	title: string;
	description: string;
	conceptId?: string;
	conceptName?: string;
	estimatedMinutes: number;
	type: 'LEARN' | 'PRACTICE' | 'REVIEW' | 'QUIZ' | 'FLASHCARD';
	status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
	priority: 'LOW' | 'MEDIUM' | 'HIGH';
	whyReason: string;
	isAiRecommended?: boolean;
	completedAt?: string;
	createdAt: string;
}

export interface DailyPlanItem {
	id: string;
	order: number;
	taskId?: string;
	title: string;
	conceptName?: string;
	estimatedMinutes: number;
	type: 'REVIEW' | 'LEARN' | 'PRACTICE' | 'FLASHCARDS' | 'QUIZ';
	status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
	whyReason: string;
}

export interface DailyPlan {
	id: string;
	goalId: string;
	userId: string;
	date: string; // YYYY-MM-DD
	availableMinutes: number;
	items: DailyPlanItem[];
	summary: string;
	weakAreaFocus?: string;
	isOnTrack: boolean;
	progressPercentage: number;
	createdAt: string;
}

export interface NoteBacklink {
	noteId: string;
	noteTitle: string;
	anchorText: string;
}

export interface Note {
	id: string;
	goalId: string;
	userId: string;
	title: string;
	markdownContent: string;
	extractedConcepts: string[];
	suggestedConnections: { conceptName: string; reason: string; connected: boolean }[];
	backlinks: NoteBacklink[];
	createdAt: string;
	updatedAt: string;
}

export interface InboxItem {
	id: string;
	userId: string;
	goalId?: string;
	type: 'URL' | 'YOUTUBE' | 'ARTICLE' | 'SNIPPET' | 'QUESTION' | 'NOTE';
	title: string;
	content: string;
	url?: string;
	triageStatus: 'INBOX' | 'PROCESSED' | 'ARCHIVED';
	aiSuggestedGoalTitle?: string;
	aiSummary?: string;
	tags: string[];
	createdAt: string;
}

export interface LearningQuestion {
	id: string;
	goalId: string;
	userId: string;
	questionText: string;
	status: 'UNRESOLVED' | 'INVESTIGATING' | 'UNDERSTOOD';
	notes?: string;
	conceptName?: string;
	createdAt: string;
	lastRevisitedAt?: string;
}

export interface DiagnosticQuestion {
	id: string;
	conceptName: string;
	questionText: string;
	codeSnippet?: string;
	options: string[];
}

export interface DiagnosticEvaluationResult {
	estimatedLevel: string;
	conceptStates: {
		conceptName: string;
		category: string;
		state: ConceptStateType;
		score: number;
		reason: string;
	}[];
	diagnosticSummary: string;
}

export interface QuizQuestion {
	id: string;
	conceptId: string;
	conceptName: string;
	questionText: string;
	codeSnippet?: string;
	questionType: 'MULTIPLE_CHOICE' | 'CODE_ANALYSIS' | 'CONCEPT_EXPLANATION';
	options: string[];
	correctOptionIndex: number;
	explanation: string;
	difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface Quiz {
	id: string;
	goalId: string;
	title: string;
	mode: 'QUICK' | 'CONCEPT' | 'WEAK_AREA' | 'REVISION' | 'EXAM';
	targetConceptNames: string[];
	questions: QuizQuestion[];
	createdAt: string;
}

export interface QuizAttempt {
	id: string;
	quizId: string;
	goalId: string;
	userId: string;
	score: number;
	maxScore: number;
	percentage: number;
	userAnswers: { questionId: string; selectedOptionIndex: number; isCorrect: boolean }[];
	conceptBreakdown: { conceptName: string; correctCount: number; totalCount: number; statusChangedTo?: ConceptStateType }[];
	misconceptions: string[];
	feedback: string;
	timestamp: string;
}

export interface Flashcard {
	id: string;
	goalId: string;
	userId: string;
	conceptId?: string;
	conceptName: string;
	source: 'NOTE' | 'QUIZ_MISTAKE' | 'CONCEPT' | 'MANUAL';
	front: string;
	back: string;
	intervalDays: number;
	easeFactor: number;
	repetitions: number;
	nextReviewDate: string; // YYYY-MM-DD
	lastReviewedAt?: string;
	createdAt: string;
}

export interface TeachBackSession {
	id: string;
	goalId: string;
	userId: string;
	conceptId: string;
	conceptName: string;
	promptScenario: string;
	userExplanation: string;
	score: number; // 0 - 100
	clarityScore: number; // 0 - 100
	depthScore: number; // 0 - 100
	correctnessScore: number; // 0 - 100
	strengths: string[];
	missingConcepts: string[];
	misconceptions: string[];
	feedback: string;
	conceptStateBefore: ConceptStateType;
	conceptStateAfter: ConceptStateType;
	createdAt: string;
}

export interface CuratedResource {
	id: string;
	goalId: string;
	conceptId?: string;
	conceptName: string;
	title: string;
	type: 'YOUTUBE_VIDEO' | 'YOUTUBE_PLAYLIST' | 'ARTICLE' | 'DOCUMENTATION' | 'PRACTICE_PROBLEM' | 'COURSE';
	url: string;
	durationMinutes: number;
	level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
	whyRecommended: string[];
	rating: number;
}

export interface AdaptiveEvent {
	id: string;
	goalId: string;
	userId: string;
	triggerType: 'QUIZ_GAP' | 'TEACH_BACK_MISCONCEPTION' | 'SPACED_DECAY' | 'FEASIBILITY_OVERLOAD' | 'MANUAL_DEMO';
	detectedGapConcept: string;
	adjustmentsSummary: string;
	details: string[];
	timestamp: string;
}

export interface CreateGoalRequest {
	title: string;
	motivation: GoalMotivationType;
	targetOutcome: string;
	deadlineDays: number;
	dailyMinutesBudget: number;
	studyDaysPerWeek: number;
	preferences: ModalityPreference[];
	priorKnowledge: string;
	knownConcepts?: string[];
	weakConcepts?: string[];
	unknownConcepts?: string[];
}

export interface CaptureInboxRequest {
	type: 'URL' | 'YOUTUBE' | 'ARTICLE' | 'SNIPPET' | 'QUESTION' | 'NOTE';
	title: string;
	content: string;
	url?: string;
	goalId?: string;
}
