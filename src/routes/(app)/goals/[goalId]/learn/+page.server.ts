import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { dbStore } from '$lib/server/db/store';
import { DailyPlanService } from '$lib/server/services/daily-plan.service';
import { RoadmapService } from '$lib/server/services/roadmap.service';
import { KnowledgeService } from '$lib/server/services/knowledge.service';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/login');
	}

	const goalId = params.goalId;
	const goal = dbStore.getGoalById(goalId, user.id);
	if (!goal) {
		throw redirect(303, '/goals/new');
	}

	const dailyPlan = DailyPlanService.getOrCreateDailyPlan(goalId, user.id);
	const concepts = dbStore.getConcepts(goalId);
	const conceptsWithState = KnowledgeService.getConceptStates(goalId, user.id);
	const roadmap = await RoadmapService.getOrCreateRoadmap(goalId, user.id);

	return {
		goal,
		dailyPlan,
		concepts,
		conceptsWithState,
		roadmap
	};
};
