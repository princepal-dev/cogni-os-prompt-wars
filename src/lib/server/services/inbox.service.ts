// Universal Learning Inbox Service: Quick Capture & AI Triage

import crypto from 'node:crypto';
import { dbStore } from '../db/store';
import type { InboxItem, CaptureInboxRequest } from '$lib/types/domain';

export class InboxService {
	// Capture item into Universal Inbox
	public static capture(userId: string, req: CaptureInboxRequest): InboxItem {
		const goals = dbStore.getGoals(userId);
		let aiSuggestedGoalTitle = '';
		let targetGoalId = req.goalId;

		// Intelligent triage matching
		if (!targetGoalId && goals.length > 0) {
			const text = `${req.title} ${req.content} ${req.url || ''}`.toLowerCase();
			const matched = goals.find((g) => {
				const keywords = g.title.toLowerCase().split(' ');
				return keywords.some((kw) => kw.length > 3 && text.includes(kw));
			});
			if (matched) {
				targetGoalId = matched.id;
				aiSuggestedGoalTitle = matched.title;
			} else {
				aiSuggestedGoalTitle = goals[0].title;
				targetGoalId = goals[0].id;
			}
		}

		const item: InboxItem = {
			id: crypto.randomUUID(),
			userId,
			goalId: targetGoalId,
			type: req.type,
			title: req.title.trim(),
			content: req.content.trim(),
			url: req.url?.trim(),
			triageStatus: 'INBOX',
			aiSuggestedGoalTitle,
			aiSummary: `Captured ${req.type.toLowerCase()} resource organized for ${aiSuggestedGoalTitle || 'Study'}.`,
			tags: [req.type.toLowerCase()],
			createdAt: new Date().toISOString()
		};

		dbStore.saveInboxItem(item);
		return item;
	}

	public static getInbox(userId: string): InboxItem[] {
		return dbStore.getInboxItems(userId);
	}

	public static updateTriageStatus(id: string, userId: string, status: 'INBOX' | 'PROCESSED' | 'ARCHIVED'): boolean {
		const items = dbStore.getInboxItems(userId);
		const item = items.find((i) => i.id === id);
		if (item) {
			item.triageStatus = status;
			dbStore.saveInboxItem(item);
			return true;
		}
		return false;
	}

	public static deleteItem(id: string, userId: string): boolean {
		return dbStore.deleteInboxItem(id, userId);
	}
}
