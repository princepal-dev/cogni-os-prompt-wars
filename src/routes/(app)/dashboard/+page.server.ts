import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { dbStore } from '$lib/server/db/store';
import { GoalService } from '$lib/server/services/goal.service';
import { KnowledgeService } from '$lib/server/services/knowledge.service';
import { DailyPlanService } from '$lib/server/services/daily-plan.service';
import { FlashcardService } from '$lib/server/services/flashcard.service';
import { TaskService } from '$lib/server/services/task.service';
import { NotesService } from '$lib/server/services/notes.service';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/login');
	}

	const userId = user.id;
	const goals = await GoalService.getUserGoals(userId);
	const activeGoal = goals[0] || null;

	if (!activeGoal) {
		return {
			user,
			goal: null,
			goals: [],
			conceptsWithState: [],
			dailyPlan: {
				id: '',
				goalId: '',
				userId,
				date: new Date().toISOString().split('T')[0],
				items: [],
				totalEstimatedMinutes: 0,
				completedMinutes: 0
			},
			dueFlashcardsCount: 0,
			tasks: [],
			notes: [],
			timelineEvents: [],
			questions: []
		};
	}

	const conceptsWithState = KnowledgeService.getConceptStates(activeGoal.id, userId);
	const dailyPlan = DailyPlanService.getOrCreateDailyPlan(activeGoal.id, userId);
	const dueFlashcards = FlashcardService.getDueFlashcards(activeGoal.id, userId);
	const tasks = TaskService.getTasks(activeGoal.id, userId);
	const notes = NotesService.getNotes(activeGoal.id, userId);
	const timelineEvents = dbStore.getTimelineEvents(activeGoal.id, userId);
	const questions = dbStore.getQuestions(activeGoal.id, userId);

	return {
		user,
		goal: activeGoal,
		goals,
		conceptsWithState,
		dailyPlan,
		dueFlashcardsCount: dueFlashcards.length,
		tasks,
		notes: notes.slice(0, 4),
		timelineEvents: timelineEvents.slice(0, 5),
		questions
	};
};
