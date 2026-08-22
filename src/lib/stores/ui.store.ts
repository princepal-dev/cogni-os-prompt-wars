// Client UI & Navigation Store

import { writable } from 'svelte/store';
import type { User, LearningGoal } from '$lib/types/domain';

export interface UiState {
	activeGoalId: string | null;
	sidebarExpanded: boolean;
	quickCaptureModalOpen: boolean;
	magicMomentTriggering: boolean;
}

const initialUiState: UiState = {
	activeGoalId: null,
	sidebarExpanded: true,
	quickCaptureModalOpen: false,
	magicMomentTriggering: false
};

function createUiStore() {
	const { subscribe, set, update } = writable<UiState>(initialUiState);

	return {
		subscribe,
		setActiveGoalId: (id: string | null) => update((s) => ({ ...s, activeGoalId: id })),
		toggleSidebar: () => update((s) => ({ ...s, sidebarExpanded: !s.sidebarExpanded })),
		setSidebarExpanded: (expanded: boolean) => update((s) => ({ ...s, sidebarExpanded: expanded })),
		setQuickCaptureOpen: (open: boolean) => update((s) => ({ ...s, quickCaptureModalOpen: open })),
		setMagicMomentTriggering: (triggering: boolean) => update((s) => ({ ...s, magicMomentTriggering: triggering })),
		reset: () => set(initialUiState)
	};
}

export const uiStore = createUiStore();

// Auth Store for client-side user session cache
export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		isAuthenticated: false
	});

	return {
		subscribe,
		setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
		clear: () => set({ user: null, isAuthenticated: false })
	};
}

export const authStore = createAuthStore();
