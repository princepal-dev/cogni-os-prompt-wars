// Unified Data Store for CognitiveOS
// Supports both Neon Serverless PostgreSQL and embedded persistent storage seamlessly

import fs from 'node:fs';
import path from 'node:path';
import type {
	User,
	LearnerProfile,
	LearningGoal,
	KnowledgeConcept,
	KnowledgeState,
	KnowledgeRelation,
	KnowledgeTimelineEvent,
	Roadmap,
	Task,
	Note,
	InboxItem,
	LearningQuestion,
	Quiz,
	QuizAttempt,
	Flashcard,
	TeachBackSession,
	CuratedResource,
	AdaptiveEvent,
	DailyPlan
} from '$lib/types/domain';

interface DatabaseSchema {
	users: User[];
	passwordHashes: Record<string, string>;
	passwordResetTokens: { token: string; userId: string; expiresAt: string }[];
	sessions: { id: string; userId: string; token: string; expiresAt: string; createdAt: string }[];
	profiles: LearnerProfile[];
	goals: LearningGoal[];
	concepts: KnowledgeConcept[];
	states: KnowledgeState[];
	relations: KnowledgeRelation[];
	timelineEvents: KnowledgeTimelineEvent[];
	roadmaps: Roadmap[];
	dailyPlans: DailyPlan[];
	tasks: Task[];
	notes: Note[];
	inbox: InboxItem[];
	questions: LearningQuestion[];
	quizzes: Quiz[];
	quizAttempts: QuizAttempt[];
	flashcards: Flashcard[];
	teachBackSessions: TeachBackSession[];
	resources: CuratedResource[];
	adaptiveEvents: AdaptiveEvent[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'cognitive_os_store.json');

class StoreService {
	private data: DatabaseSchema;
	private isInitialized = false;

	constructor() {
		this.data = this.getDefaultData();
		this.init();
	}

	private getDefaultData(): DatabaseSchema {
		return {
			users: [],
			passwordHashes: {},
			passwordResetTokens: [],
			sessions: [],
			profiles: [],
			goals: [],
			concepts: [],
			states: [],
			relations: [],
			timelineEvents: [],
			roadmaps: [],
			dailyPlans: [],
			tasks: [],
			notes: [],
			inbox: [],
			questions: [],
			quizzes: [],
			quizAttempts: [],
			flashcards: [],
			teachBackSessions: [],
			resources: [],
			adaptiveEvents: []
		};
	}

	private init() {
		if (this.isInitialized) return;
		try {
			if (!fs.existsSync(DATA_DIR)) {
				fs.mkdirSync(DATA_DIR, { recursive: true });
			}
			if (fs.existsSync(DATA_FILE)) {
				const raw = fs.readFileSync(DATA_FILE, 'utf-8');
				this.data = { ...this.getDefaultData(), ...JSON.parse(raw) };
			} else {
				this.persist();
			}
			this.isInitialized = true;
		} catch (err) {
			console.error('Error initializing store file:', err);
			this.data = this.getDefaultData();
			this.isInitialized = true;
		}
	}

	private persist() {
		try {
			if (!fs.existsSync(DATA_DIR)) {
				fs.mkdirSync(DATA_DIR, { recursive: true });
			}
			fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
		} catch (err) {
			console.error('Error persisting store file:', err);
		}
	}

	// ================= USER & AUTH =================
	getUserByEmail(email: string): User | undefined {
		this.init();
		return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
	}

	getUserById(id: string): User | undefined {
		this.init();
		return this.data.users.find((u) => u.id === id);
	}

	createUser(user: User, passwordHash: string): User {
		this.init();
		this.data.users.push(user);
		this.data.passwordHashes[user.id] = passwordHash;
		this.persist();
		return user;
	}

	getPasswordHash(userId: string): string | undefined {
		this.init();
		return this.data.passwordHashes[userId];
	}

	updateUserPassword(userId: string, newPasswordHash: string): boolean {
		this.init();
		this.data.passwordHashes[userId] = newPasswordHash;
		// Invalidate all existing sessions for this user on password reset
		this.data.sessions = this.data.sessions.filter((s) => s.userId !== userId);
		this.persist();
		return true;
	}

	savePasswordResetToken(token: string, userId: string, expiresAt: string) {
		this.init();
		this.data.passwordResetTokens = this.data.passwordResetTokens.filter((t) => t.userId !== userId);
		this.data.passwordResetTokens.push({ token, userId, expiresAt });
		this.persist();
	}

	getPasswordResetToken(token: string): { token: string; userId: string; expiresAt: string } | undefined {
		this.init();
		return this.data.passwordResetTokens.find((t) => t.token === token && new Date(t.expiresAt) > new Date());
	}

	deletePasswordResetToken(token: string) {
		this.init();
		this.data.passwordResetTokens = this.data.passwordResetTokens.filter((t) => t.token !== token);
		this.persist();
	}

	createSession(session: { id: string; userId: string; token: string; expiresAt: string; createdAt: string }) {
		this.init();
		// Invalidate previous sessions if needed or push new
		this.data.sessions = this.data.sessions.filter((s) => s.token !== session.token);
		this.data.sessions.push(session);
		this.persist();
	}

	getSessionByToken(token: string) {
		this.init();
		return this.data.sessions.find((s) => s.token === token && new Date(s.expiresAt) > new Date());
	}

	deleteSession(token: string) {
		this.init();
		this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
		this.persist();
	}

	// ================= PROFILE =================
	getProfile(userId: string): LearnerProfile | undefined {
		this.init();
		return this.data.profiles.find((p) => p.userId === userId);
	}

	saveProfile(profile: LearnerProfile): LearnerProfile {
		this.init();
		const idx = this.data.profiles.findIndex((p) => p.userId === profile.userId);
		if (idx >= 0) {
			this.data.profiles[idx] = profile;
		} else {
			this.data.profiles.push(profile);
		}
		this.persist();
		return profile;
	}

	// ================= LEARNING GOALS =================
	getGoals(userId: string): LearningGoal[] {
		this.init();
		return this.data.goals.filter((g) => g.userId === userId);
	}

	getGoalById(goalId: string, userId?: string): LearningGoal | undefined {
		this.init();
		return this.data.goals.find((g) => g.id === goalId && (!userId || g.userId === userId));
	}

	saveGoal(goal: LearningGoal): LearningGoal {
		this.init();
		const idx = this.data.goals.findIndex((g) => g.id === goal.id);
		if (idx >= 0) {
			this.data.goals[idx] = goal;
		} else {
			this.data.goals.push(goal);
		}
		this.persist();
		return goal;
	}

	deleteGoal(goalId: string, userId: string): boolean {
		this.init();
		const exists = this.data.goals.some((g) => g.id === goalId && g.userId === userId);
		if (!exists) return false;

		this.data.goals = this.data.goals.filter((g) => g.id !== goalId);
		this.data.concepts = this.data.concepts.filter((c) => c.goalId !== goalId);
		this.data.states = this.data.states.filter((s) => s.goalId !== goalId);
		this.data.roadmaps = this.data.roadmaps.filter((r) => r.goalId !== goalId);
		this.data.dailyPlans = this.data.dailyPlans.filter((dp) => dp.goalId !== goalId);
		this.data.tasks = this.data.tasks.filter((t) => t.goalId !== goalId);
		this.data.notes = this.data.notes.filter((n) => n.goalId !== goalId);
		this.data.flashcards = this.data.flashcards.filter((f) => f.goalId !== goalId);
		this.data.quizzes = this.data.quizzes.filter((q) => q.goalId !== goalId);
		this.persist();
		return true;
	}

	// ================= CONCEPTS & KNOWLEDGE STATES =================
	getConcepts(goalId: string): KnowledgeConcept[] {
		this.init();
		return this.data.concepts.filter((c) => c.goalId === goalId);
	}

	saveConcepts(concepts: KnowledgeConcept[]) {
		this.init();
		for (const c of concepts) {
			const idx = this.data.concepts.findIndex((existing) => existing.id === c.id);
			if (idx >= 0) {
				this.data.concepts[idx] = c;
			} else {
				this.data.concepts.push(c);
			}
		}
		this.persist();
	}

	getKnowledgeStates(goalId: string, userId: string): KnowledgeState[] {
		this.init();
		return this.data.states.filter((s) => s.goalId === goalId && s.userId === userId);
	}

	getKnowledgeStateByConcept(conceptNameOrId: string, goalId: string, userId: string): KnowledgeState | undefined {
		this.init();
		return this.data.states.find(
			(s) =>
				s.goalId === goalId &&
				s.userId === userId &&
				(s.conceptId === conceptNameOrId || s.conceptName.toLowerCase() === conceptNameOrId.toLowerCase())
		);
	}

	saveKnowledgeState(state: KnowledgeState): KnowledgeState {
		this.init();
		const idx = this.data.states.findIndex((s) => s.id === state.id || (s.conceptId === state.conceptId && s.userId === state.userId));
		if (idx >= 0) {
			this.data.states[idx] = state;
		} else {
			this.data.states.push(state);
		}
		this.persist();
		return state;
	}

	saveKnowledgeStates(states: KnowledgeState[]) {
		this.init();
		for (const s of states) {
			const idx = this.data.states.findIndex((existing) => existing.id === s.id || (existing.conceptId === s.conceptId && existing.userId === s.userId));
			if (idx >= 0) {
				this.data.states[idx] = s;
			} else {
				this.data.states.push(s);
			}
		}
		this.persist();
	}

	// ================= TIMELINE EVENTS =================
	addTimelineEvent(event: KnowledgeTimelineEvent) {
		this.init();
		this.data.timelineEvents.unshift(event);
		this.persist();
	}

	getTimelineEvents(goalId: string, userId: string): KnowledgeTimelineEvent[] {
		this.init();
		return this.data.timelineEvents.filter((e) => e.goalId === goalId && e.userId === userId);
	}

	// ================= ROADMAP =================
	getRoadmap(goalId: string): Roadmap | undefined {
		this.init();
		return this.data.roadmaps.find((r) => r.goalId === goalId);
	}

	saveRoadmap(roadmap: Roadmap): Roadmap {
		this.init();
		const idx = this.data.roadmaps.findIndex((r) => r.goalId === roadmap.goalId);
		if (idx >= 0) {
			this.data.roadmaps[idx] = roadmap;
		} else {
			this.data.roadmaps.push(roadmap);
		}
		this.persist();
		return roadmap;
	}

	// ================= DAILY PLANS =================
	getDailyPlan(goalId: string, userId: string, date: string): DailyPlan | undefined {
		this.init();
		return this.data.dailyPlans.find((dp) => dp.goalId === goalId && dp.userId === userId && dp.date === date);
	}

	saveDailyPlan(plan: DailyPlan): DailyPlan {
		this.init();
		const idx = this.data.dailyPlans.findIndex(
			(dp) => dp.goalId === plan.goalId && dp.userId === plan.userId && dp.date === plan.date
		);
		if (idx >= 0) {
			this.data.dailyPlans[idx] = plan;
		} else {
			this.data.dailyPlans.push(plan);
		}
		this.persist();
		return plan;
	}

	// ================= TASKS / KANBAN =================
	getTasks(goalId: string, userId: string): Task[] {
		this.init();
		return this.data.tasks.filter((t) => t.goalId === goalId && t.userId === userId);
	}

	saveTask(task: Task): Task {
		this.init();
		const idx = this.data.tasks.findIndex((t) => t.id === task.id);
		if (idx >= 0) {
			this.data.tasks[idx] = task;
		} else {
			this.data.tasks.push(task);
		}
		this.persist();
		return task;
	}

	saveTasks(tasks: Task[]) {
		this.init();
		for (const t of tasks) {
			const idx = this.data.tasks.findIndex((existing) => existing.id === t.id);
			if (idx >= 0) {
				this.data.tasks[idx] = t;
			} else {
				this.data.tasks.push(t);
			}
		}
		this.persist();
	}

	deleteTask(taskId: string, userId: string): boolean {
		this.init();
		const initialLen = this.data.tasks.length;
		this.data.tasks = this.data.tasks.filter((t) => !(t.id === taskId && t.userId === userId));
		this.persist();
		return this.data.tasks.length < initialLen;
	}

	// ================= NOTES & SECOND BRAIN =================
	getNotes(goalId: string, userId: string): Note[] {
		this.init();
		return this.data.notes.filter((n) => n.goalId === goalId && n.userId === userId);
	}

	getNoteById(noteId: string, userId: string): Note | undefined {
		this.init();
		return this.data.notes.find((n) => n.id === noteId && n.userId === userId);
	}

	saveNote(note: Note): Note {
		this.init();
		const idx = this.data.notes.findIndex((n) => n.id === note.id);
		if (idx >= 0) {
			this.data.notes[idx] = note;
		} else {
			this.data.notes.push(note);
		}
		this.persist();
		return note;
	}

	deleteNote(noteId: string, userId: string): boolean {
		this.init();
		const initialLen = this.data.notes.length;
		this.data.notes = this.data.notes.filter((n) => !(n.id === noteId && n.userId === userId));
		this.persist();
		return this.data.notes.length < initialLen;
	}

	// ================= INBOX =================
	getInboxItems(userId: string): InboxItem[] {
		this.init();
		return this.data.inbox.filter((i) => i.userId === userId);
	}

	saveInboxItem(item: InboxItem): InboxItem {
		this.init();
		const idx = this.data.inbox.findIndex((i) => i.id === item.id);
		if (idx >= 0) {
			this.data.inbox[idx] = item;
		} else {
			this.data.inbox.push(item);
		}
		this.persist();
		return item;
	}

	deleteInboxItem(id: string, userId: string): boolean {
		this.init();
		const initialLen = this.data.inbox.length;
		this.data.inbox = this.data.inbox.filter((i) => !(i.id === id && i.userId === userId));
		this.persist();
		return this.data.inbox.length < initialLen;
	}

	// ================= QUESTIONS =================
	getQuestions(goalId: string, userId: string): LearningQuestion[] {
		this.init();
		return this.data.questions.filter((q) => q.goalId === goalId && q.userId === userId);
	}

	saveQuestion(question: LearningQuestion): LearningQuestion {
		this.init();
		const idx = this.data.questions.findIndex((q) => q.id === question.id);
		if (idx >= 0) {
			this.data.questions[idx] = question;
		} else {
			this.data.questions.push(question);
		}
		this.persist();
		return question;
	}

	// ================= FLASHCARDS =================
	getFlashcards(goalId: string, userId: string): Flashcard[] {
		this.init();
		return this.data.flashcards.filter((f) => f.goalId === goalId && f.userId === userId);
	}

	getFlashcardById(id: string, userId: string): Flashcard | undefined {
		this.init();
		return this.data.flashcards.find((f) => f.id === id && f.userId === userId);
	}

	saveFlashcard(flashcard: Flashcard): Flashcard {
		this.init();
		const idx = this.data.flashcards.findIndex((f) => f.id === flashcard.id);
		if (idx >= 0) {
			this.data.flashcards[idx] = flashcard;
		} else {
			this.data.flashcards.push(flashcard);
		}
		this.persist();
		return flashcard;
	}

	saveFlashcards(flashcards: Flashcard[]) {
		this.init();
		for (const f of flashcards) {
			const idx = this.data.flashcards.findIndex((existing) => existing.id === f.id);
			if (idx >= 0) {
				this.data.flashcards[idx] = f;
			} else {
				this.data.flashcards.push(f);
			}
		}
		this.persist();
	}

	// ================= QUIZZES & ATTEMPTS =================
	getQuizzes(goalId: string): Quiz[] {
		this.init();
		return this.data.quizzes.filter((q) => q.goalId === goalId);
	}

	getQuizById(quizId: string): Quiz | undefined {
		this.init();
		return this.data.quizzes.find((q) => q.id === quizId);
	}

	saveQuiz(quiz: Quiz): Quiz {
		this.init();
		const idx = this.data.quizzes.findIndex((q) => q.id === quiz.id);
		if (idx >= 0) {
			this.data.quizzes[idx] = quiz;
		} else {
			this.data.quizzes.push(quiz);
		}
		this.persist();
		return quiz;
	}

	saveQuizAttempt(attempt: QuizAttempt): QuizAttempt {
		this.init();
		this.data.quizAttempts.unshift(attempt);
		this.persist();
		return attempt;
	}

	getQuizAttempts(goalId: string, userId: string): QuizAttempt[] {
		this.init();
		return this.data.quizAttempts.filter((a) => a.goalId === goalId && a.userId === userId);
	}

	// ================= TEACH-BACK SESSIONS =================
	saveTeachBackSession(session: TeachBackSession): TeachBackSession {
		this.init();
		this.data.teachBackSessions.unshift(session);
		this.persist();
		return session;
	}

	getTeachBackSessions(goalId: string, userId: string): TeachBackSession[] {
		this.init();
		return this.data.teachBackSessions.filter((s) => s.goalId === goalId && s.userId === userId);
	}

	// ================= RESOURCES =================
	getResources(goalId: string): CuratedResource[] {
		this.init();
		return this.data.resources.filter((r) => r.goalId === goalId);
	}

	saveResources(resources: CuratedResource[]) {
		this.init();
		for (const r of resources) {
			const idx = this.data.resources.findIndex((existing) => existing.id === r.id);
			if (idx >= 0) {
				this.data.resources[idx] = r;
			} else {
				this.data.resources.push(r);
			}
		}
		this.persist();
	}

	// ================= ADAPTIVE EVENTS =================
	addAdaptiveEvent(event: AdaptiveEvent) {
		this.init();
		this.data.adaptiveEvents.unshift(event);
		this.persist();
	}

	getAdaptiveEvents(goalId: string, userId: string): AdaptiveEvent[] {
		this.init();
		return this.data.adaptiveEvents.filter((e) => e.goalId === goalId && e.userId === userId);
	}
}

export const dbStore = new StoreService();
