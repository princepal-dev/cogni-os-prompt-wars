import { writable } from 'svelte/store';

export interface ToastMessage {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastMessage[]>([]);

	function show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 4000) {
		const id = Math.random().toString(36).substring(2, 9);
		const toast: ToastMessage = { id, type, message, duration };
		update((toasts) => [...toasts, toast]);

		if (duration > 0) {
			setTimeout(() => {
				dismiss(id);
			}, duration);
		}
		return id;
	}

	function dismiss(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		show,
		success: (msg: string, duration?: number) => show(msg, 'success', duration),
		error: (msg: string, duration?: number) => show(msg, 'error', duration),
		info: (msg: string, duration?: number) => show(msg, 'info', duration),
		warning: (msg: string, duration?: number) => show(msg, 'warning', duration),
		dismiss
	};
}

export const toast = createToastStore();
