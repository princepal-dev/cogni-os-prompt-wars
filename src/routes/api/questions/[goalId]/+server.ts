import { json, type RequestHandler } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { dbStore } from '$lib/server/db/store';
import type { LearningQuestion } from '$lib/types/domain';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const goalId = params.goalId as string;
	const questions = dbStore.getQuestions(goalId, user.id);
	return json({ success: true, data: questions });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const { questionText, conceptName, notes } = await request.json();
		if (!questionText?.trim()) {
			return json({ success: false, error: { code: 'INVALID_INPUT', message: 'Question text is required' } }, { status: 400 });
		}

		const question: LearningQuestion = {
			id: crypto.randomUUID(),
			goalId: params.goalId as string,
			userId: user.id,
			questionText: questionText.trim(),
			status: 'UNRESOLVED',
			notes: notes?.trim() || '',
			conceptName: conceptName?.trim() || undefined,
			createdAt: new Date().toISOString(),
			lastRevisitedAt: new Date().toISOString()
		};

		dbStore.saveQuestion(question);
		return json({ success: true, data: question });
	} catch (err: any) {
		return json({ success: false, error: { code: 'SAVE_FAILED', message: err.message } }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	try {
		const { questionId, status, notes } = await request.json();
		const questions = dbStore.getQuestions('', user.id);
		const question = questions.find((q) => q.id === questionId && q.userId === user.id);
		if (!question) {
			return json({ success: false, error: { code: 'NOT_FOUND', message: 'Question not found' } }, { status: 404 });
		}

		if (status) question.status = status;
		if (notes !== undefined) question.notes = notes;
		question.lastRevisitedAt = new Date().toISOString();

		dbStore.saveQuestion(question);
		return json({ success: true, data: question });
	} catch (err: any) {
		return json({ success: false, error: { code: 'UPDATE_FAILED', message: err.message } }, { status: 500 });
	}
};
